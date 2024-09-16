import express from 'express';
import multer from 'multer'
import sharp from 'sharp'
import cors from 'cors'
import fs from 'fs'
import dotenv from "dotenv";
import path from 'path';
const app = express();
const port = process.env.port || 3000
dotenv.config({
  path: "./.env",
});

app.use(cors());
app.use(express.json());

// Configure Multer for image upload
const upload = multer({ dest: 'uploads/' });

// Image processing route for preview
app.post('/process', upload.single('image'), async (req, res) => {
  const { brightness, lightness, saturation, rotation } = req.body;
  const imagePath = req.file?.path;
  if (!imagePath) return res.status(400).json({ error: 'Image is required' });

  try {
    const processedImage = await sharp(imagePath)
      .png()
      .rotate(Number(rotation) || 0)
      .modulate({
        saturation: Number(saturation) || 1,
        brightness: Number(brightness) || 1,
        lightness: Number(lightness) || 1,
     })
      .toBuffer();
      res.set('Content-Type', 'image/jpeg');
      res.send(processedImage);
  } catch (err) {
    res.status(500).json({ error: 'Processing failed' });
  } 
  finally{
    fs.unlinkSync(imagePath)
  }

    
});

// Final download route for high-quality image
app.post('/download',upload.single('image'),async (req, res)  => {
  const { brightness, lightness, saturation, rotation, format } = req.body;
   
  const imagePath= req.file?.path;
  if (!imagePath) return res.status(400).json({ error: 'Image is required' });

  try {
     const processedImage =sharp(imagePath)
      .rotate(Number(rotation) || 0)
      .modulate({
        brightness: Number(brightness) || 1,
        lightness: Number(lightness) || 1,
        saturation: Number(saturation) || 1,
      });
      
      const finalBuffer = await (format ==='jpeg'
      ? processedImage.jpeg().toBuffer()
      : processedImage.png().toBuffer());

      res.set('Content-Type', `image/${format}`);
      res.send(finalBuffer);

  } catch (err) {
    res.status(500).json({ error: 'Processing failed' });
  }
  finally{
    fs.unlinkSync(imagePath)
  }


});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});