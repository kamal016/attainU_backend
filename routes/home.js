const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../database.js");
const imageThumbnail = require('image-thumbnail');
const { log } = require("debug");
const jsonpatch = require("jsonpatch") 

router.post("/", authorize, async (req, res) => {
  try {
    const user = await pool.query(`SELECT user_name,id FROM users WHERE id = ${req.user.id}`); 
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post('/post', authorize, async (req, res)=>{
  try{
      const timestamp = Date.now()
      let query_str = `INSERT INTO address (userId ,address,timestamp) VALUES ('${req.body.id}', '${req.body.address.replace("'","")}','${timestamp}')`
      pool.query(query_str,(err, result)=>{
          if(err){
            res.status(400).send("not saved")
            console.log(err.stack);
          }
          res.status(200).send("Address saved")
        })
  }catch(e){
    console.log(e);
  }
})


router.post('/thumbnail', authorize ,async (req, res)=>{
      const imgUrl = `${req.body.url}`
      let options = { width: 50, height: 50, responseType: 'base64'}
      try {
        const thumbnail = await imageThumbnail({ uri: imgUrl }, options);
        var img = Buffer.from(thumbnail, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
          });
        res.end(img); 
    } catch (err) {
        res.status(400).send("Unsuccessful")
        console.error(err);
    }
});


router.post('/jsonPatch', authorize ,async (req, res)=>{
  const myObject = req.body
  try {
      const thepatch = [
        { "op": "replace", "path": "/baz", "value": "boo" }
      ]
      patcheddoc = await jsonpatch.apply_patch(myObject, thepatch);
      res.status(200)
      res.send(patcheddoc)
    } catch (err) {
        res.status(400).send("Unsuccessful")
        console.error(err);
    }
});



module.exports = router;