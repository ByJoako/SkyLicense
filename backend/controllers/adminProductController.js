const productModel = require('../models/Products');
const licenseModel = require('../models/Licenses');
const formidable = require('formidable');
const fs = require('fs').promises;
const path = require('path');

const uploadDir = path.resolve('uploads');

async function readImage(name) {
    try {
        const bufferImg = await fs.readFile(path.join(uploadDir, `${name}-image.png`));
        return bufferImg.toString('base64');
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
}

async function getProducts(req, res) {
    try {
        const products = await productModel.find();
        
        const productsWithImageURL = await Promise.all(products.map(async (product) => {
            const base64Img = await readImage(product.name);
            return {
                ...product.toObject(),
                image: base64Img ? `data:image/png;base64,${base64Img}` : null
            };
        }));

        res.json(productsWithImageURL);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching products" });
    }
}

const renameFile = async (file, newPath) => {
    if (!file?.filepath) return;
    try {
        await fs.rename(file.filepath, newPath);
        console.log(`File moved to ${newPath}`);
    } catch (error) {
        console.error(`Error renaming file: ${error.message}`);
        throw new Error('Failed to rename file');
    }
};

const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
            uploadDir,
            keepExtensions: true,
            allowEmptyFiles: true,
            minFileSize: 0
        });

        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            
            for (const key in fields) {
                if (Array.isArray(fields[key])) fields[key] = fields[key][0];
            }
            for (const file in files) {
                if (Array.isArray(files[file])) files[file] = files[file][0];
            }

            resolve({ fields, files });
        });
    });
};

async function create(req, res) {
    try {
        const { fields, files } = await parseForm(req);
        const { name, description, versionName, roleId } = fields;
        const { image, file } = files;

        if (!name || !description || !versionName || !roleId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const productExist = await productModel.findOne({ name });
        if (productExist) {
            return res.status(400).json({ message: 'The product name already exists.' });
        }

        if (image?.filepath) {
            await renameFile(image, path.join(uploadDir, `${name}-image${path.extname(image.originalFilename)}`));
        }

        if (file?.filepath) {
            await renameFile(file, path.join(uploadDir, `${name}-${versionName}${path.extname(file.originalFilename)}`));
        }

        await productModel.create({
            name,
            description,
            role_id: roleId,
            versions: [{ value: versionName, timestamp: Date.now() }]
        });

        res.status(201).json({ message: 'Product created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function edit(req, res) {
    try {
        const { fields, files } = await parseForm(req);
        const { productId, description, versionName, roleId } = fields;
        const { image, file } = files;
        
        if (!productId) {
            return res.status(400).json({ message: 'Missing product ID' });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (versionName && file?.filepath) {
            await renameFile(file, path.join(uploadDir, `${product.name}-${versionName}${path.extname(file.originalFilename)}`));
            product.versions.push({ value: versionName, timestamp: Date.now() });
        } else if (versionName) {
            product.versions = product.versions.filter(v => v.value !== versionName);
        } else {
            if (!description || !roleId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            
            if (image?.filepath) {
                await renameFile(image, path.join(uploadDir, `${product.name}-image${path.extname(image.originalFilename)}`));
            }
            
            product.description = description;
            product.role_id = roleId;
        }

        await product.save();
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product' });
    }
}

async function remove(req, res) {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Missing product ID' });
        }

        const deletedProduct = await productModel.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await licenseModel.deleteMany({ product: deletedProduct.name });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting product' });
    }
}

module.exports = { getProducts, create, edit, remove };