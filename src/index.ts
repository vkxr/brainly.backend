require('dotenv').config();
import  { Request, Response } from "express";
import express from "express"
import z, { string } from "zod";
import { contentModel, linkModel, userModel } from "./db";
import jwt from "jsonwebtoken";
import { UserMiddleware } from "./middleware";
import { hash } from "./util";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in the environment variables")
}



const app = express();

app.use(express.json());

const SignupInput = z.object({
  name: z.string().min(3).max(10),
  username: z.string().min(3).max(20).email(),
  password: z.string().min(5).max(20),
});
const SigninInput = z.object({
  username: z.string().min(3).max(20).email(),
  password: z.string().min(5).max(20),
});

app.post("/api/v1/signup", async (req, res) => {

  try {
    const parsedData = SignupInput.safeParse(req.body);

    if (!parsedData.success) {
      res.status(411).json({
        message: "Error in inputs",
      });
      return;
    }
    const { name, username, password } = parsedData.data;

    await userModel.create({
      name: name,
      username: username,
      password: password,
    });

    res.status(200).json({
      message: "Signed up",
    });
  } catch (err) {

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  try {
    const parsedData = SigninInput.safeParse(req.body);
    if (!parsedData.success) {
      res.status(411).json({
        message: "Error in inputs"

      })
      return;
    }
    const { username, password } = parsedData.data;

    const response = await userModel.findOne({
      username,
      password
    })
    console.log(response);
    if (!response) {
      res.status(404).json({
        message: "Not Signed up"
      })
      return;
    } else {
      const token = jwt.sign({
        id: response._id
      }, secret)

      res.status(200).json({
        token: token
      })
    }


  } catch (e) {
    res.status(500).json({
      message: "Internal Server Error"
    })

  }

})

app.post("/api/v1/content", UserMiddleware, async (req: Request, res: Response) => {
  const { link, title, type } = req.body;
  if (!link || !title || !type) {
    res.status(404).json({
      message: "contents fields are missing"
    })
    return;
  }

  await contentModel.create({
    link: link,
    title: title,
    type: type,
    tags: [],
    userId: req.userId
  });

  res.status(200).json({
    message: "Content created successfully"
  });
});

app.get("/api/v1/content", UserMiddleware, async (req, res) => {
    const userId = req.userId;
   const content = await contentModel.findOne({
      userId
    }).populate("userId", "username");

    res.status(200).json({
      content
    })

});

app.delete("/api/v1/content", UserMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
 const response = await contentModel.deleteOne({
    _id: contentId,
    userId:req.userId
  })
  if(!response){
    res.status(403).json({
      message:"you are not the author of this content"
    })
    return;
  }
  res.status(200).json({
    message: "content deleted",
  });
});

app.post("/api/v1/brain/share", UserMiddleware, async (req, res) => {
  const share = req.body.share;
  if(share){
    const shareLink = hash(10);
    await linkModel.create({
      hash: shareLink,
      userId: req.userId
    })
    res.status(200).json({
      message: "Share link created",
      shareLink
    })
  }else{
    await linkModel.deleteOne({
      userId: req.userId

    })
    res.status(201).json({
      message: "ShareLink is disabled",
    });
  }
 
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const shareLink = req.params.shareLink;
    
    // Find the user associated with this share link
    const linkDoc = await linkModel.findOne({
      hash: shareLink
    });

    if (!linkDoc) {
       res.status(404).json({
        message: "Share link not found or expired"
      });
      return;
    }

    // Find all content for this user
    const content = await contentModel.find({
      userId: linkDoc.userId
    }).populate("userId", "username");

    res.status(200).json({
      content
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

app.listen(8080);
