const glob = require("glob-promise");
const sharp = require("sharp");
const fs = require("fs");


(async () => {
    const paths = await glob('./**/*.{gif,png,jpg,jpeg}', {ignore:'./_site/**'}).then((paths) => {
        return paths;
    });

    for (const path of paths) {
        const { data, info } = await sharp(path)
        .resize(1140, 1140, {fit: 'inside', withoutEnlargement: true})
        .toBuffer({ resolveWithObject: true });


        await fs.promises.writeFile(path, data); 
    }
})();
