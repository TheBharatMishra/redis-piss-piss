const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");
const app = express();

const DEFAULT_EXPIRATION = 3600;
const RedisClient = Redis.createClient();

app.use(cors());
app.use(urlencoded({ extended: true }));

app.get("/photos", async (req, res) => {
  const albumId = req.params.albumId;
  const photos = await getOrSetCache(
    `photos?albumId=${req.params.id}`,
    async () => {
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos",
        { params: { albumId } }
      );
      return data;
    }
  );

  res.json(photos);

  // DYNAMIC FUNCTION IS DEFINED DOWN BELOW THIS IS JUST FOR FUTURE REFERNCE
  //   RedisClient.get(`photos?albumId=${albumId}`, async (error, photos) => {
  //     if (error) console.log(error);
  //     if (photos != null) {
  //       return res.json(JSON.parse(photos));
  //     } else {
  //       const { data } = await axios.get(
  //         "https://jsonplaceholder.typicode.com/photos",
  //         { params: { albumId } }
  //       );
  //       RedisClient.setex("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
  //     }
  //   });
});
const photo = await getOrSetCache(`photos:${req.params.id}`, async () => {
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos"
  );
  return data;
});
// app.get("/photos/:id", async (req, res) => {
//   const { data } = await axios.get(
//     `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
//   );
//   res.json(data);
// });

function getOrSetCache(key, cb) {
  return new Promise((resolve, reject) => {
    RedisClient.get(key, async (error, data) => {
      if (error) console.log(error);
      if (photos != null) return resolve(JSON.parse(photos));
      else {
        const freshData = await cb();
        RedisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
        resolve(data);
      }
    });
  });
}

app.listen(6969);
