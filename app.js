const algoliasearch = require("algoliasearch");
const bodyParser = require("body-parser");
var express = require("express"); // Get the module
const path = require("path");
var app = express();

app.use(bodyParser());

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_ID = process.env.ALGOLIA_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_ID);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

let oID = 0;

app.listen(process.env.PORT || 3000, () => {
  console.log("connected");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/index.html"));
});

app.get("/add_product", (req, res) => {
  res.sendFile(path.join(__dirname, "src/add_product.html"));
});

app.get("/search_product", (req, res) => {
  res.sendFile(path.join(__dirname, "src/search_product.html"));
});

function getobjectID() {
  let hits = [];

  index
    .browseObjects({
      query: "",
      attributesToRetrieve: ["objectID", "name", "price", "quantity"],
      batch: (batch) => {
        hits = hits.concat(batch);
      },
    })
    .then(() => {
      oID = parseInt(hits[hits.length - 1]["objectID"]) + 1;
      console.log(oID);

      //    return hits[hits.length - 1]["objectID"];

      //  return hits;
    });

  //return hits;
}

app.get("/all_products", (req, res) => {
  getobjectID();
});

app.post("/add", (req, res) => {
  getobjectID();
  const product = [
    {
      objectID: oID,
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
    },
  ];

  console.log(req.body.name);

  index
    .saveObjects(product)
    .then(({ productIDs }) => {
      return res.json({
        message: "Product has been added to inventory",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/search", (req, res) => {
  const key = req.query.key;
  index
    .search(key)
    .then(({ hits }) => {
      return res.json(hits);
    })
    .catch((err) => {
      console.log(err);
    });
});
