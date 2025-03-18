const BlacklistModel = require('../models/Blacklist');
const RequestModel = require('../models/Request');
const LicenseModel = require('../models/Licenses');
const ProductModel = require('../models/Products');
const { EmbedBuilder, sendToDiscord } = require('../utils/EmbedBuilder');

// Auxiliary functions for validation
const isBodyIncomplete = (body) => !body.licensekey || !body.product || !body.version || !body.hwid;
const isLicenseExpired = (license) => license.expires && license.expires <= Date.now();
const isProductInvalid = (license, product) => license.product !== product;

// Function to get the real IP of the client
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',').shift().trim() || req.connection.remoteAddress.replace("::ffff:", "") || '0.0.0.0';
};

// Function to create a Discord embed for logging
const createEmbed = (title, color, fields) => {
    const embed = new EmbedBuilder().setTitle(title).setColor(color);
    fields.forEach(({ name, value, inline }) => embed.addField(name, value, inline));
    return embed.build();
};

// Function to log request and send response
const logAndRespond = async (res, status, message, code, logData) => {
    const { licensekey, ip, hwid, country, embed } = logData;
    await RequestModel.create({ license_key: licensekey, ip, hwid, status: message, code, country });
    if (embed) sendToDiscord(embed);
    return res.status(status).json({ message, code });
};

// Main API function
async function restAPI(req, res) {
    const apiKey = req.headers.authorization;

    if (!apiKey || apiKey !== process.env.CODE_PRIVATE) {
        return res.status(403).json({ message: 'Acceso prohibido: Header inválido o ausente.' });
    }
    
    const { licensekey, product, version, hwid } = req.body;
    const ip = getClientIp(req);
    let country = 'Unknown';

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        if (data && data.country) {
          country = data.country;
        }
      } catch (error) {
        console.warn("No se pudo obtener el país de la IP:", error);
      }
    // Validate if the body is complete
    if (isBodyIncomplete(req.body)) {
        const embed = createEmbed('Body invalid', '#990F02', [
            { name: 'Body entries', value: '```' + `\n${Object.entries(req.body)}\n` + '```' },
            { name: 'IP-Address', value: `${ip} (${country})`, inline: true }
        ]);
        return logAndRespond(res, 400, 'The body is incomplete', '400', { licensekey, ip, hwid, country, embed });
    }

    // Check blacklist
    const checkBlacklist = await BlacklistModel.findOneAndUpdate({ $or: [{ ip }, { hwid }]}, { $inc: { request: 1 }}, { new: true, upsert: false });
    if (checkBlacklist) {
        const embed = createEmbed('BlackList', '#990F02', [
            { name: 'License Key', value: '```' + `\n${licensekey}\n` + '```' },
            { name: 'Product', value: product, inline: true },
            { name: 'Version', value: version, inline: true },
            { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
            { name: 'HWID', value: hwid, inline: true }
        ]);
        return logAndRespond(res, 403, 'You\'re very bad. What are you trying? :\'(', '666', { licensekey, ip, hwid, country, embed });
    }

    try {
        const license = await LicenseModel.findOne({ license_key: licensekey });
        if (!license) {
            const embed = createEmbed('License invalid', '#990F02', [
                { name: 'License Key', value: '```' + `\n${licensekey}\n` + '```' },
                { name: 'Product', value: product, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                { name: 'HWID', value: hwid, inline: true }
            ]);
            return logAndRespond(res, 400, 'The license does not exist', '400', { licensekey, ip, hwid, country, embed });
        }

        // Check if the license is disabled
        if (license.disabled) {
            const embed = createEmbed('License disabled', '#ff0000', [
                { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                { name: 'Product', value: product, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                { name: 'HWID', value: hwid, inline: true },
                { name: 'Client Name', value: license.client_name },
                { name: 'Client Id', value: license.client_id, inline: true },
                { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
            ]);
            return logAndRespond(res, 400, 'The license is disabled', '400', { licensekey, ip, hwid, country, embed });
        }

        // Check if the license has expired
        if (isLicenseExpired(license)) {
            const embed = createEmbed('License expired', '#ff8000', [
                { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                { name: 'Product', value: product, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                { name: 'HWID', value: hwid, inline: true },
                { name: 'Client Name', value: license.client_name },
                { name: 'Client Id', value: license.client_id, inline: true },
                { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
            ]);
            return logAndRespond(res, 400, 'The license has expired', '400', { licensekey, ip, hwid, country, embed });
        }

        // Check if the product is valid
        if (isProductInvalid(license, product)) {
            const embed = createEmbed('Product invalid', '#ff0000', [
                { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                { name: 'Product', value: product, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                { name: 'HWID', value: hwid, inline: true },
                { name: 'Client Name', value: license.client_name },
                { name: 'Client Id', value: license.client_id, inline: true },
                { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
            ]);
            return logAndRespond(res, 400, 'The product is invalid', '400', { licensekey, ip, hwid, country, embed });
        }

        // Check if the product exists
        const productData = await ProductModel.findOne({ name: product });
        if (!productData) {
            const embed = createEmbed('Product invalid', '#ff0000', [
                { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                { name: 'Product', value: product, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                { name: 'HWID', value: hwid, inline: true },
                { name: 'Client Name', value: license.client_name },
                { name: 'Client Id', value: license.client_id, inline: true },
                { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
            ]);
            return logAndRespond(res, 400, 'The product does not exist', '400', { licensekey, ip, hwid, country, embed });
        }

        // Check if the version exists in the product
        if (!productData.versions.includes(version)) {
            const embed = createEmbed('Product version invalid', '#ff0000', [
                { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                { name: 'Product', value: product, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                { name: 'HWID', value: hwid, inline: true },
                { name: 'Client Name', value: license.client_name },
                { name: 'Client Id', value: license.client_id, inline: true },
                { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
            ]);
            return logAndRespond(res, 400, 'The version does not exist in the product', '400', { licensekey, ip, hwid, country, embed });
        }

        // Add the IP to the list of IPs and check the IP limit
        const ipIndex = license.ip_list.findIndex(item => item.ip === ip);
        if (ipIndex !== -1) {
            // Update the date if the IP already exists
            license.ip_list[ipIndex].date = Date.now();
        } else {
            // Add new IP
            if (license.ip_list.length >= license.ip_cap) {
                const embed = createEmbed('IP limit reached', '#ff8000', [
                    { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                    { name: 'Product', value: product, inline: true },
                    { name: 'Version', value: version, inline: true },
                    { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                    { name: 'HWID', value: hwid, inline: true },
                    { name: 'Client Name', value: license.client_name },
                    { name: 'Client Id', value: license.client_id, inline: true },
                    { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                    { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                    { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                    { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                    { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                    { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                    { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                    { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                    { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
                ]);
                return logAndRespond(res, 400, 'The IP limit has been reached', '400', { licensekey, ip, hwid, country, embed });
            }
            license.ip_list.push({ ip, date: Date.now() });
        }

        // Add the HWID to the list of HWIDs and check the HWID limit
        const hwidIndex = license.hwid_list.findIndex(item => item.hwid === hwid);
        if (hwidIndex !== -1) {
            // Update the date if the HWID already exists
            license.hwid_list[hwidIndex].date = Date.now();
        } else {
            // Add new HWID
            if (license.hwid_list.length >= license.hwid_cap) {
                const embed = createEmbed('HWID limit reached', '#ff8000', [
                    { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
                    { name: 'Product', value: product, inline: true },
                    { name: 'Version', value: version, inline: true },
                    { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
                    { name: 'HWID', value: hwid, inline: true },
                    { name: 'Client Name', value: license.client_name },
                    { name: 'Client Id', value: license.client_id, inline: true },
                    { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
                    { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
                    { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
                    { name: 'IP Cap', value: `${license.ip_list.length}/${license.ip_cap}`, inline: true },
                    { name: 'IP Expiration', value: `${license.ip_expires} ${license.ip_expires_unit}`, inline: true },
                    { name: 'IP list', value: '```yaml' + `\n${license.ip_list.length > 0 ? license.ip_list.map((x, index) => `${index + 1}. ${x.ip}`).join('\n') : 'Empty'}` + '```' },
                    { name: 'HWID Cap', value: `${license.hwid_list.length}/${license.hwid_cap}`, inline: true },
                    { name: 'HWID Expiration', value: `${license.hwid_expires} ${license.hwid_expires_unit}`, inline: true },
                    { name: 'HWID list', value: '```yaml' + `\n${license.hwid_list.length > 0 ? license.hwid_list.map((x, index) => `${index + 1}. ${x.hwid}`).join('\n') : 'Empty'}` + '```' }
                ]);
                return logAndRespond(res, 400, 'The HWID limit has been reached', '400', { licensekey, ip, hwid, country, embed });
            }
            license.hwid_list.push({ hwid, date: Date.now() });
        }

        // Update license details
        license.latest_ip = ip;
        license.latest_hwid = hwid;
        license.latest_request = Date.now();
        license.latest_total++;

        // Save any changes to the license
        await license.save();

        // If the version is not the latest, add the latest version to the JSON
        const latestVersion = productData.versions[productData.versions.length - 1];
        const response = { message: 'The license is valid and active', code: '000' };
        if (version !== latestVersion) {
            response.latestVersion = latestVersion;
        }
        const stringBuf = product + Date.now().toString().slice(0, -5) + licensekey.slice(0, -7);
        const bff = Buffer.from(stringBuf, 'utf-16le');
        response.socket = bff.toString('base64');

        const embed = createEmbed('Successful authentication', '#00ff00', [
            { name: 'License Key', value: '```yaml' + `\n${licensekey}\n` + '```' },
            { name: 'Product', value: product, inline: true },
            { name: 'Version', value: version, inline: true },
            { name: 'Client Name', value: license.client_name },
            { name: 'Client Id', value: license.client_id, inline: true },
            { name: 'Created by', value: `<@${license.created_by}>`, inline: true },
            { name: 'Created at', value: `<t:${Math.floor(license.created_at / 1000)}:R>`, inline: true },
            { name: 'Expires in', value: `${license.expires ? `<t:${Math.floor(license.expires / 1000)}:R>` : `Never`}` },
            { name: 'IP-Address', value: `${ip} (${country})`, inline: true },
            { name: 'HWID', value: hwid, inline: true }
        ]);
        sendToDiscord(embed);
        updateDailyRequest(1, 0, country);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error checking the license:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { restAPI };