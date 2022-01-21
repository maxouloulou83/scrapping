const puppeteer = require('puppeteer');
let lib = require("../module/lib.js");


(async () => {

    const browser = await puppeteer.launch({headless: true});
    const mainUrl = 'https://www.womanizer.com/fr/all-products';
    const page = await browser.newPage();
    await page.goto(mainUrl);

    // Array ou toutes les données seront stocker
    let data = [];

    // Compteur de produit
    let productCount = 0;

    // Nom du fichier d'enregistrement
    const filename = 'womanizer-product.json';

    // Attendre que le selector des liquides charge
    await page.waitForSelector('#amasty-shopby-product-list > div.products--wrapper > ol > li > div > div > a');

    // Stock toutes les infos des buttons vers les collections
    const products = await page.$$('#amasty-shopby-product-list > div.products--wrapper > ol > li > div > div > a');

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

        const selectImage = '#maincontent > div.columns > div > div > div > div > div  > div > div > div > div > div > img';
        const selectTitle = '#maincontent > div.columns > div > div> div.info__title > div.page-title-wrapper > h1 > span';
        const selectDesc = ' #maincontent > div.columns > div > div > div.info__short.product__attribute > div';
        const selectMatiere = "//span[contains(., 'Matériel du tête')]//following::span[1]";
        const selectColors = "//span[contains(., 'Colors')]//following::span[1]";
        const selectPrice = '#maincontent > div.columns > div > div > div.info__price.product-info-price > div.price-box.price-final_price > div > span > span > span > span';

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
            images = ''
        });
        // console.log(images)


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
        // console.log(title)

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

        // colors
        let colors;
        await productPage.waitForXPath(selectColors, {timeout: 5000}).then(async () => {
            let elHandle = await productPage.$x(selectColors);
            let colorsString = await productPage.evaluate(
                el => (el.textContent)
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .replace('.', ''),
                (elHandle[''])
            );
            colors = colorsString.split(', ');
        }).catch(() => {
            colors = ['']
        });
        console.log(colors)

        // colors
        let matiere;
        await productPage.waitForXPath(selectMatiere, {timeout: 5000}).then(async () => {
            let elHandle = await productPage.$x(selectMatiere);
            let matiereString = await productPage.evaluate(
                el => (el.textContent)
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .replace('.', ''),
                (elHandle[''])
            );
            matiere = matiereString.split(', ');
        }).catch(() => {
            matiere = ['']
        });
        console.log(matiere)



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
                brand: 'womanizer',
                images,
                title,
                description,
                colors,
                matiere,
                price
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