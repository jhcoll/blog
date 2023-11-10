const glob = require("glob-promise");
const sharp = require("sharp");
const fs = require("fs");


(async () => {
    const paths = await glob('./**/*.{gif,png,jpg,jpeg}', {ignore:'./_site/**'}).then((paths) => {
        return paths;
    });

    for (const path of paths) {
        try{
            const beforeStats = await fs.promises.stat(path);
            console.log('Resizing image: ', path);
            console.log('Size before resize: size - ', beforeStats.size);
            const { data, info } = await sharp(path)
            .resize(1140, 1140, {fit: 'inside', withoutEnlargement: true})
            .toBuffer({ resolveWithObject: true });

            console.log('Size after resize: width - ', info.width, ', height - ', info.height, ', size - ', info.size);

            await fs.promises.writeFile(path, data); 
        } catch (err) {
            console.error('failed to resize image: ', path);
        }
    }
})();
