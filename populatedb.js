#! /usr/bin/env node

console.log(
    'This script populates some test Websites, pets, and their relationships to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Website = require("./models/website");
  
  const websites = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createWebsites();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  

  async function createWebsites() {
    console.log("Adding Websites");
    await Promise.all([
      websiteCreate(0, "url1"),
      websiteCreate(1, "url2"),
      websiteCreate(2, "url3"),
      websiteCreate(3, "url4"),
    ]);
  }
  
  
  async function websiteCreate(index, url) {
    const website = new Website({ id: index , url: url});
    await website.save();
    websites[index] = website;
    console.log(`Added website: ${url}`);
  }
  