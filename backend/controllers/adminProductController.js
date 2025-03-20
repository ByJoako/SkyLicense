const productModel = require('../models/Products');
const formidable = require('formidable');
const fs = require('fs').promises;

async function getProducts(req, res) {
  const Products = await productModel.find();
  req.json(products);
}

async function create(req, res) {
  const { fields, files } = await parseForm(req);
  
  const { name, description, versionName, roleId } = fields;
  const { image, file } = files;
  
}

async function edit(req, res) {
  
}

async function remove(req, res) {
  
}

const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
          uploadDir: path.join('uploads'),
          keepExtensions: true,
          allowEmptyFiles: true,
          minFileSize: 0
        });
        
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                for (const key in fields) {
                     if (Array.isArray(fields[key])) {
                        fields[key] = fields[key][0];
                    }
                }
                resolve({ fields, files });
            }
        });
    });
};

module.exports = {
  getProducts,
  create,
  edit,
  remove
};