const puppeteer = require('puppeteer');
let lib = require("../module/lib.js");


(async () => {

    const browser = await puppeteer.launch({headless: true});
    const mainUrl = 'https://www.we-vibe.com/fr/sex-toys';
    const page = await browser.newPage();
    await page.goto(mainUrl);

    // Array ou toutes les données seront stocker
    let data = [];

    // Compteur de produit
    let productCount = 0;

    // Nom du fichier d'enregistrement
    const filename = 'we-vibe-all-product.json';

    // Attendre que le selector des liquides charge
    await page.waitForSelector('#amasty-shopby-product-list > div.products.products--grid.grid > ol > li > div > div > a');

    // Stock toutes les infos des buttons vers les collections
    const products = await page.$$('#amasty-shopby-product-list > div.products.products--grid.grid > ol > li > div > div > a');

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

        const selectImage = '#maincontent > div.columns.container-fluid > div > div > div > div > div > div > div > div > div  > div > img';
        const selectTitle = '#maincontent > div.columns.container-fluid > div > div > div.info__title > div.page-title-wrapper > h1 > span';
        const selectDesc = '#maincontent > div.columns.container-fluid > div > div.product__info.info.col-12.col-md-5.offset-md-1.product-info-main > div.info__short.body2.product__attribute > div';
        const selectColors = '#product-options-wrapper > div > div > div > div > div';
        const selectPrice = '#maincontent > div.columns.container-fluid > div > div > div > div > span.old-price > span > span > span ';

        let images;
        await productPage.waitForSelector(selectImage).then(async () => {
            const data = await productPage.$$(selectImage)

            const ProductImagesPropertyJsHandles = await Promise.all(
                data.map(handle => handle.getProperty('src'))
            );

            // Envoie les liens json dans un array
            images = await Promise.all(
                ProductImagesPropertyJsHandles.map(handle => handle.jsonValue())
            );

        }).catch(() => {
            images = ['']
        });
        console.log(images)


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
        console.log(description)

        // Titre
        let colors;
        await productPage.waitForSelector(selectColors).then(async () => {
            const data = await productPage.$$(selectColors)

            const ProductColorsPropertyJsHandles = await Promise.all(
                data.map(handle => handle.getProperty('aria-label'))
            );

            // Envoie les liens json dans un array
            colors = await Promise.all(
                ProductColorsPropertyJsHandles.map(handle => handle.jsonValue())
            );

        }).catch(() => {
            colors = ''
        });
        console.log(colors)

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
        console.log(price)




        // Stock les informations du liquide dans l'array reprenenant les anciennes données
        data = [
            ...data,
            {
                type: 'product',
                brand: 'fun',
                images,
                title,
                description,
                colors,
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