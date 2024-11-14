require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { users } = require('../config/schema');
const express = require('express');
const { eq } = require('drizzle-orm');
const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { createS3File, deleteS3File } = require('../utility/s3BucketUtil');
const fs = require('fs');

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const uploadsDir = path.join(__dirname, "../temporary_image_storage");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir); 
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Route to get user information by email
router.get('/get-accepted-terms', async (req, res) => {
  const { userId } = req.query;
  try {
      console.log("Searching for accepted_terms for: ", userId);
      const user = await db
          .select({ 
              accepted_terms: users.accepted_terms
          })
          .from(users)
          .where(eq(users.cognito_id, userId))
          .execute();
      console.log("Finished Searching for accepted_terms",);
      
      res.status(200).json(user);
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error fetching user data' });
  }
});


// Route to get user information by email
router.get('', async (req, res) => {
    const { user_email } = req.query;
    try {
        console.log("Searching for user_id for:", user_email);
        const user = await db
            .select({ 
                user_id: users.user_id, 
                name: users.name, 
                email: users.email, 
                notification_opt_in: users.notification_opt_in,
                accepted_terms: users.accepted_terms,
                user_profile_pic: users.user_profile_pic
            })
            .from(users)
            .where(eq(users.email, user_email))
            .execute();
        console.log("Finished Searching for user_id",);
        
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching user data' });
    }
});

router.put('/update-accepted-terms', async (req, res) => {
  const { userEmail, emailNotification } = req.body;

  if(!userEmail) {
    console.log("No or improper userEmail Given, userEmail: ", userEmail);
    return res.status(400).send("No or improper userEmail Given");
  }
  try {
    console.log("Updating accepted_terms to true");
    await db
    .update(users)
    .set(
      {
       accepted_terms: true,
       notification_opt_in: emailNotification
      }
    )
    .where(eq(users.email, userEmail))
    .execute();
    console.log("Finished Updating accepted_terms to true");

    res.status(200).send("Successfully updated accepted_terms to true");
  } catch (error) {
    res.status(400).send("Failed to set accepted_terms to true");
  }
});

// Route to update notification preference
router.put('/update-opt-in', async (req, res) => {
    const { id, notification_opt_in } = req.body;
    try {

      console.log("Updating user name for user: ", id);
      const result = await db.update(users)
        .set({ notification_opt_in: notification_opt_in })
        .where(eq(users.user_id, id))
        .execute();
      if (result.changes === 0) {
        res.status(404).send('User not found');
      }
      console.log("Finshed Updating user name for user: ", id);

      res.status(200).json({ user_id: id, notification_opt_in });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error updating notification preference' });
    }
});

// Route to update user name and email
router.put('/update-name-email', async (req, res) => {
    const { id, name, email } = req.body;
    try {
      console.log("Updating name and email to: ", name, " ", email);
      const result = await db.update(users)
        .set({ name: name, email: email })
        .where(eq(users.user_id, id))
        .execute();
      if (result.changes === 0) {
        res.status(404).send('User not found');
      }
      console.log("Finished updating name and email for user: ", id);
      res.status(200).json({ user_id: id, name, email });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error updating user name or email' });
    }
});

// Route to update user name and email
router.put('/update-username', async (req, res) => {
  const { id, name } = req.body;
  try {
    console.log("Updating name to", name, " for ", id);
    const result = await db.update(users)
      .set({ name: name })
      .where(eq(users.user_id, id))
      .execute();

    if (result.changes === 0) {
      res.status(404).send('User not found');
    }

    console.log("Finished updating name and email for user: ", id);
    res.status(200).send("Successfully updated username");
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error updating user name or email' });
  }
});

router.delete("/delete-user", async (req, res) => {
  const { userEmail, userId } = req.body;

  try {
    console.log(`Deleting User ${userEmail} from Cognito`);
    
    const deleteUserCommand = new AdminDeleteUserCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: userEmail,
    });

    const response = await cognito.send(deleteUserCommand);
    console.log("Cognito response:", response);

    console.log(`User ${userEmail} deleted from Cognito`);

    console.log("deleting user from database");
    await db
      .delete(users)
      .where(eq(users.user_id, userId))
      .execute();
    console.log(" Sueccesfully deleting user from database");

    res.status(200).send("Successfully deleted user");

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ error: 'Error deleting user from Cognito or database' });
  }
});


router.put('/update-profile-pic', upload.single('profileImage'), async (req, res) => {
  const { userId } = req.body;

  if(!userId || isNaN(userId)) {
    console.log("No or improper userId given, userId: ", userId);
    return res.status(404).send("No or improper userId given");
  }

  let image = null;
  if(req.file)
    image = req.file;
  else {
    console.log("No Image Provided");
    return res.status(404).send("No Image Provided");
  }
  console.log("userId: ", userId);

  try {
    let imageUrl = null;
    if(image)
    {
      console.log("Creating S3 Image File\n");    
      try {
        imageUrl = await createS3File(image);
      } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error creating image for S3 Bucket'});
      }
    }
    
    console.log("Starting update profile picture")
    await db
      .update(users)
      .set({ user_profile_pic: imageUrl })
      .where(
        eq(users.user_id, userId)
      )
      .execute();

    console.log("Successfully updated profile picture")
    res.status(200).send("Successfully updated profile picture");
  } catch (error) {
    
    console.log("Error updating profile picture");
    console.log(error);
    res.status(404).send("Error updating profile picture");
  }
});

module.exports = router;
