const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const QRCode = require("qrcode");
const cloudinary = require("cloudinary").v2;

// =========================
// CLOUDINARY CONFIGURATION
// =========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// =========================
// SLUGIFY
// =========================
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// =========================
// UPLOAD BUFFER TO CLOUDINARY
// =========================
function uploadBufferToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(file.buffer);
  });
}


// =========================
// SHOP ROUTES
// =========================
module.exports = (app, db) => {

  // =========================
  // GET MY SHOP
  // =========================
  app.get("/api/shop/me", auth, async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM shops WHERE vendor_id = ?",
        [req.vendor.id]
      );

      res.json(rows[0] || null);

    } catch (e) {
      console.error("GET SHOP ERROR:", e);

      res.status(500).json({
        message: "Could not load shop",
        error: e.message
      });
    }
  });


  // =========================
  // CREATE SHOP
  // =========================
  app.post(
    "/api/shop",
    auth,
    upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "upiQr", maxCount: 1 }
    ]),
    async (req, res) => {

      try {
        const b = req.body;

        // Required fields
        if (
          !b.shopName ||
          !b.category ||
          !b.ownerName ||
          !b.mobile ||
          !b.address
        ) {
          return res.status(400).json({
            message: "Please fill all required shop details"
          });
        }


        // Check if vendor already has a shop
        const [existing] = await db.query(
          "SELECT id FROM shops WHERE vendor_id = ?",
          [req.vendor.id]
        );

        if (existing.length) {
          return res.status(409).json({
            message:
              "You already have a shop. Edit your existing shop instead."
          });
        }


        // Create slug
        let slug =
          slugify(b.shopName) ||
          `shop-${req.vendor.id}`;


        // Check slug
        const [slugRows] = await db.query(
          "SELECT id FROM shops WHERE slug = ?",
          [slug]
        );

        if (slugRows.length) {
          slug = `${slug}-${req.vendor.id}`;
        }


        // Uploaded files
        const logoFile = req.files?.logo?.[0];
        const upiQrFile = req.files?.upiQr?.[0];


        // Upload images to Cloudinary
        const [logoUpload, upiQrUpload] = await Promise.all([
          logoFile
            ? uploadBufferToCloudinary(
                logoFile,
                "digitalvendor/shop-logos"
              )
            : null,

          upiQrFile
            ? uploadBufferToCloudinary(
                upiQrFile,
                "digitalvendor/upi-qr"
              )
            : null
        ]);


        // Cloudinary HTTPS URLs
        const logoUrl = logoUpload
          ? logoUpload.secure_url
          : null;

        const upiQrUrl = upiQrUpload
          ? upiQrUpload.secure_url
          : null;


        // Save shop in database
        const [result] = await db.query(
          `INSERT INTO shops
          (
            vendor_id,
            shop_name,
            slug,
            category,
            owner_name,
            mobile,
            address,
            opening_time,
            closing_time,
            logo_url,
            upi_id,
            upi_qr_url
          )
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            req.vendor.id,
            b.shopName.trim(),
            slug,
            b.category,
            b.ownerName,
            b.mobile,
            b.address,
            b.openingTime || null,
            b.closingTime || null,
            logoUrl,
            b.upiId || null,
            upiQrUrl
          ]
        );


        // Generate shop QR
        const shopUrl =
          `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop/${slug}`;

        const qrDataUrl =
          await QRCode.toDataURL(shopUrl);


        res.status(201).json({
          id: result.insertId,
          slug,
          shopUrl,
          qrDataUrl
        });

      } catch (e) {

        console.error("CREATE SHOP ERROR:", e);

        res.status(500).json({
          message: "Could not create shop",
          error: e.message
        });
      }
    }
  );


  // =========================
  // UPDATE SHOP
  // =========================
  app.put(
    "/api/shop",
    auth,
    upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "upiQr", maxCount: 1 }
    ]),
    async (req, res) => {

      try {
        const b = req.body;


        // Find existing shop
        const [rows] = await db.query(
          "SELECT * FROM shops WHERE vendor_id = ?",
          [req.vendor.id]
        );

        if (!rows.length) {
          return res.status(404).json({
            message: "Shop not found"
          });
        }


        const old = rows[0];


        // Uploaded files
        const logoFile = req.files?.logo?.[0];
        const upiQrFile = req.files?.upiQr?.[0];


        // Keep old logo if no new logo uploaded
        let logoUrl = old.logo_url;

        if (logoFile) {

          const uploadedLogo =
            await uploadBufferToCloudinary(
              logoFile,
              "digitalvendor/shop-logos"
            );

          logoUrl = uploadedLogo.secure_url;
        }


        // Keep old UPI QR if no new QR uploaded
        let upiQrUrl = old.upi_qr_url;

        if (upiQrFile) {

          const uploadedQr =
            await uploadBufferToCloudinary(
              upiQrFile,
              "digitalvendor/upi-qr"
            );

          upiQrUrl = uploadedQr.secure_url;
        }


        // Update database
        await db.query(
          `UPDATE shops SET
            shop_name=?,
            category=?,
            owner_name=?,
            mobile=?,
            address=?,
            opening_time=?,
            closing_time=?,
            logo_url=?,
            upi_id=?,
            upi_qr_url=?
          WHERE vendor_id=?`,
          [
            b.shopName,
            b.category,
            b.ownerName,
            b.mobile,
            b.address,
            b.openingTime || null,
            b.closingTime || null,
            logoUrl,
            b.upiId || null,
            upiQrUrl,
            req.vendor.id
          ]
        );


        res.json({
          message: "Shop updated successfully",
          logo_url: logoUrl,
          upi_qr_url: upiQrUrl
        });

      } catch (e) {

        console.error("UPDATE SHOP ERROR:", e);

        res.status(500).json({
          message: "Could not update shop",
          error: e.message
        });
      }
    }
  );


  // =========================
  // PUBLIC SHOP
  // =========================
  app.get("/api/shop/public/:slug", async (req, res) => {

    try {

      const [shops] = await db.query(
        `SELECT
          id,
          shop_name,
          slug,
          category,
          owner_name,
          mobile,
          address,
          opening_time,
          closing_time,
          logo_url,
          upi_id,
          upi_qr_url
        FROM shops
        WHERE slug = ?`,
        [req.params.slug]
      );


      if (!shops.length) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }


      const shop = shops[0];


      const [products] = await db.query(
        `SELECT *
         FROM products
         WHERE shop_id=?
         ORDER BY created_at DESC`,
        [shop.id]
      );


      res.json({
        shop,
        products
      });

    } catch (e) {

      console.error("PUBLIC SHOP ERROR:", e);

      res.status(500).json({
        message: "Could not load shop",
        error: e.message
      });
    }
  });


  // =========================
  // SHOP QR
  // =========================
  app.get("/api/shop/:slug/qr", async (req, res) => {

    try {

      const [rows] = await db.query(
        "SELECT slug FROM shops WHERE slug=?",
        [req.params.slug]
      );


      if (!rows.length) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }


      const url =
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop/${rows[0].slug}`;


      const data =
        await QRCode.toDataURL(url);


      res.json({
        url,
        data
      });

    } catch (e) {

      console.error("SHOP QR ERROR:", e);

      res.status(500).json({
        message: "Could not generate QR",
        error: e.message
      });
    }
  });

};