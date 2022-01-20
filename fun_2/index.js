const puppeteer = require('puppeteer');
let lib = require("../module/lib.js");


(async () => {

    const browser = await puppeteer.launch({headless: true});
    const mainUrl = 'https://en.funfactory.com/collections/vibrators';
    const page = await browser.newPage();
    await page.goto(mainUrl);

    // Array ou toutes les données seront stocker
    let data = [];

    // Compteur de produit
    let productCount = 0;

    // Nom du fichier d'enregistrement
    const filename = 'fun-vibrators-product.json';

    // Attendre que le selector des liquides charge
    await page.waitForSelector('#gf-products > div > div > div > a', {timeout: 100000});

    // Stock toutes les infos des buttons vers les collections
    const products = await page.$$('#gf-products > div > div > div > a');

    // Recupère les urls
    const ProductPropertyJsHandles = await Promise.all(
        products.map(handle => handle.getProperty('href'))
    );

    // Envoie les liens json dans un array
    const productLinks = await Promise.all(
        ProductPropertyJsHandles.map(handle => handle.jsonValue())
    );
    // console.log(productLinks)


    // Pour chaque produit
    for (const productLink of productLinks) {
        // Ouvre une nouvelle fenêtre
        const productPage = await browser.newPage();
        await productPage.setViewport({
            "width": 1920,
            "height": 1080,
            "deviceScaleFactor": 1.0
        })



        await productPage.goto(productLink.toString())

        const selectImage = '.product__thumb';
        const selectTitle = 'div > div > div > div > div > h1';
        const selectDesc = ' div > div > div.grid.grid-columned > div:nth-child(1) > div';
        const selectColors = ' div.variant-wrapper.variant-wrapper > fieldset > div > input';
        const selectPrice = '.product__price';

        let images;
        await productPage.waitForSelector(selectImage).then(async () => {
            const data = await productPage.$$(selectImage)

            const ProductImagesPropertyJsHandles = await Promise.all(
                data.map(handle => handle.getProperty('href'))
            );

            // Envoie les liens json dans un array
            images = await Promise.all(
                ProductImagesPropertyJsHandles.map(handle => handle.jsonValue())
            );


        }).catch(() => {
            images = ''
        });
        // console.log(images)

        // Titre
        let colors;
        await productPage.waitForSelector(selectColors, {timeout: 10000}).then(async () => {
            const data = await productPage.$$(selectColors)

            const ProductColorsPropertyJsHandles = await Promise.all(
                data.map(handle => handle.getProperty('value'))
            );

            // Envoie les couleurs json dans un array
            colors = await Promise.all(
                ProductColorsPropertyJsHandles.map(handle => handle.jsonValue())
            );

        }).catch(() => {
            colors = ['']
        });
        console.log(colors)

        // Titre
        let title;
        await productPage.waitForSelector(selectTitle).then(async () => {
            title = await productPage.$eval(selectTitle,
                (el) => (el.innerHTML)
                    .replace(' ', '')
            );
        }).catch(() => {
            title = ['']
        });
        console.log(title)

        // console.log(title)
        //
        // Description
        let description;
        await productPage.waitForSelector(selectDesc, {timeout: 100000}).then(async () => {
            description = await productPage.$eval(selectDesc,
                (el) => (el.innerHTML)
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .trim()
            );
        }).catch(() => {
            description = ''
        });
        // console.log(description)


        // Price
        let price;
        await productPage.waitForSelector(selectPrice).then(async () => {
            price = await productPage.$eval(selectPrice,
                (el) => parseFloat((el.innerHTML)
                    .replace(',', '.'))
            );
        }).catch(() => {
            price = 0;
        });
        // console.log(price)




        // Stock les informations du liquide dans l'array reprenenant les anciennes données
        data = [
            ...data,
            {
                type: 'product',
                brand: 'fun',
                images,
                title,
                description,
                price,
            }
        ];

        // Incrémentation du nombre de liquide enregistrer
        productCount++;

        // console.log(`${productCount} - "${title}" ☑️`)

        // Ferme la page du liquide
        await productPage.close();
    }

    // Enregistrer l'array data dans un fichier
    lib.storeData(data, `./data/${filename}`)

    // Message de fin
    console.log(`\n${productCount} les sextoys bien enregsitrer: "${filename}"`)

    // Ferme le navigateur
    await browser.close();
})();