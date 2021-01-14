const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash"); //to ignore case-sensitivity
const mongoose  = require("mongoose");
require("dotenv").config()


const blogSchema = {
  title: String,
  body: String
}

const Blog = mongoose.model("Blog", blogSchema);

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

//get to home route to see all posts
app.get("/", async function(req, res) {
  await Blog.find({}, function(err, foundBlog) {
    if(!err) {
      res.render("home", {
        posts: foundBlog
      })
    }
  });
})

//get to the compose route to start new post
app.get("/compose", function(req, res) {
  res.render("compose", {
    titleValue: "",
    bodyValue: ""
  });
})

//post new post
app.post("/compose", function(req, res) {
  const blog = new Blog({
    title: req.body.postTitle,
    body: req.body.postBody,
  });
  
  blog.save(function(err) {
    if(!err) {
      res.redirect("/");
    }
  });
})

//To show full post
app.get("/posts/:postId", async function(req, res) {
  const id = req.params.postId;
  await Blog.findOne({_id: id}, function(err, foundBlog) {
    res.render("post", {
      title: foundBlog.title,
      body: foundBlog.body
    })
  })
})

//To update a post
app.get("/posts/update/:postId", async function(req, res){
  const id = req.params.postId;
  await Blog.findOne({_id : id}, function(err, foundBlog) {
    res.render("update", {
      pid: id,
      titleValue: foundBlog.title,
      bodyValue: foundBlog.body
    })
  });
})

//post an update
app.post("/posts/update/:postId", async function(req, res) {
  const id = req.params.postId;
  await Blog.findOne({_id : id}, async function(err, foundBlog) {
    foundBlog.title = req.body.postTitle;
    foundBlog.body = req.body.postBody;
    await foundBlog.save();
    res.redirect("/");
  })
})

//delete a post
app.post("/posts/delete/:postId", async function(req, res) {
  const id = req.params.postId;
  await Blog.deleteOne({_id: id});
  await Blog.find({}, function(err, foundBlog) {
    res.render("home", {
      posts: foundBlog
    })
  })
})

mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.94ex4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, 
    {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
  app.listen(process.env.PORT || 3000);
})


