const puppeteer = require('puppeteer');
let lib = require("../module/lib.js");


(async () => {

    const selectUser = 'michael@reves-intimes.fr';
    const selectPass = '030584';
    const browser = await puppeteer.launch({headless: false});
    const mainUrl = 'https://www.lovely-planet-distribution.com/fra/customer/account/login/';
    const page = await browser.newPage();
    await page.goto(mainUrl);
    console.log('Login page loading')
    await page.setDefaultNavigationTimeout(160000);
    await page.click('#email');
    await page.keyboard.type(selectUser);
    await page.click('#pass');
    await page.keyboard.type(selectPass);
    await page.click('#send2');
    console.log('login...')
    await page.waitForNavigation();

    // Ouvre la page principal avec la liste des produits
    await page.goto('https://www.lovely-planet-distribution.com/fra/docutheque/mixgliss.html?p=2');
    console.log('go on mixgliss products pages')

    // Array ou toutes les données seront stocker
    let data = [];

    // Compteur de produit
    let productCount = 0;

    // Nom du fichier d'enregistrement
    const filename = 'mixgliss-p2-product.json';

    // Attendre que le selector des produits charge
    await page.waitForSelector('#root-wrapper > div > div > div.main-container.col2-left-layout > div.main.container.show-bg > div > div.col-main.grid12-9.grid-col2-main.no-right-gutter > div > div.category-products > ul > li');

    // Stock toutes les infos des buttons vers les collections
    const products = await page.$$('#root-wrapper > div > div > div.main-container.col2-left-layout > div.main.container.show-bg > div > div.col-main.grid12-9.grid-col2-main.no-right-gutter > div > div.category-products > ul > li > a');

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

        const selectImage = '#itemslider-zoom > div> div > div > div > a';
        const selectTitle = '#product_addtocart_form > div.product-shop.grid12-5 > div.product-name > h1';
        const selectDesc = '#product-tabs > div > div:nth-child(2) > div';
        const selectDescLong = '#product-tabs > div > div:nth-child(2) > div';
        const selectPrice = '#amfpc-product\\.info\\.simple > div.price-in-fiche > div > div.grid12-6.no-gutter.ppr > span > span.price-ppr > span';
        const selectMatiere = '#product-attribute-specs-table > tbody > tr:nth-child(5) > td';
        const selectColors = '#product-attribute-specs-table > tbody > tr:nth-child(9) > td';
        const selectReference = '#amfpc-custom_tierprice > div.grid12-6.no-gutter.details-right.packings > span:nth-child(1)';
        const selectEAN = '#amfpc-custom_tierprice > div.grid12-6.no-gutter.details-right.packings > span:nth-child(5)';


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
        let title;
        await productPage.waitForSelector(selectTitle).then(async () => {
            title = await productPage.$eval(selectTitle,
                (el) => (el.innerHTML)
            );
        }).catch(() => {
            title = ['']
        });
        // console.log(title)


        // Description

        let description;
        await productPage.waitForSelector(selectDesc, {slowMo: 200}).then(async () => {
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


        // Longue Description
        let descriptionLong;
        await productPage.waitForSelector(selectDescLong, {timeout: 10000}).then(async () => {
            descriptionLong = await productPage.$eval(selectDescLong,
                (el) => (el.innerHTML)
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .trim()
            );
        }).catch(() => {
            descriptionLong = ''
        });
        // console.log(descriptionLong)

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


        // matiere
        let matiere;
        await productPage.waitForSelector(selectMatiere, {timeout: 100000}).then(async () => {
            matiere = await productPage.$eval(selectMatiere,
                (el) => (el.innerHTML)
            );
        }).catch(() => {
            matiere = ''
        });
        // console.log(matiere)


        //colors
        let colors;
        await productPage.waitForSelector(selectColors, {timeout: 100000}).then(async () => {
            colors = await productPage.$eval(selectColors,
                (el) => (el.innerHTML)
            );
        }).catch(() => {
            colors = ''
        });
        // console.log(colors)


        //reference
        let reference;
        await productPage.waitForSelector(selectReference, {timeout: 10000}).then(async () => {
            reference = await productPage.$eval(selectReference,
                (el) => (el.innerHTML)
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\r?\n|\r/g, '')
                    .trim()
            );
        }).catch(() => {
            reference = 0
        });
        // console.log(reference)


        // EAN
        let EAN;
        await productPage.waitForSelector(selectEAN, {timeout: 100000}).then(async () => {
            EAN = await productPage.$eval(selectEAN,
                (el) => (el.innerHTML)
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\r?\n|\r/g, '')
                    .trim()
            );
        }).catch(() => {
            EAN = 0
        });
        // console.log(EAN)


        // Stock les informations du produit dans l'array reprenenant les anciennes données
        data = [
            ...data,
            {
                type: 'product',
                brand: 'lovely',
                images,
                title,
                description,
                description_long: descriptionLong,
                price,
                matiere,
                colors,
                reference,
                EAN
            }
        ];

        // Incrémentation du nombre de produits enregistrer
        productCount++;

        console.log(`${productCount} - "${title}" 🍓️`)

        // Ferme la page du produit
        await productPage.close();
    }

    // Enregistrer l'array data dans un fichier
    lib.storeData(data, `./data/${filename}`)

    // Message de fin
    console.log(`\n${productCount} produits ont été enregistrer dans le fichier: "${filename}"`)

    // Ferme le navigateur
    await browser.close();
})();
