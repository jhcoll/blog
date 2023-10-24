import fs from "fs";

let data = [];
// read all files from the folder
const folder = "./scripts/generate-related/data/";
const files = fs.readdirSync(folder);
files.forEach((file) => {
  const content = fs.readFileSync(folder + file, "utf8");
  data.push({
    file,
    data: JSON.parse(content),
  });
});

function computeDistance(arr1, arr2) {
  let distance = 0;
  for (let i = 0; i < arr1.length; i++) {
    distance += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(distance);
}

function filenameToUrl(filename) {
  const year = filename.split("-")[0];
  const month = filename.split("-")[1];
  const day = filename.split("-")[2];
  const name = filename.endsWith("md")
    ? filename.substring(11, filename.length - 3)
    : filename.substring(11, filename.length - 9);
  return `/${year}/${month}/${day}/${name}.html`;
}

data.forEach((d, i) => {
  const neighbours = data.filter((_, j) => i !== j);
  const distances = neighbours.map((n) => ({
    item: n,
    distance: computeDistance(d.data, n.data),
  }));
  const sortedDistances = distances.sort((a, b) => a.distance - b.distance);

  console.log(`${filenameToUrl(d.file)}:
  - ${filenameToUrl(sortedDistances[0].item.file)}
  - ${filenameToUrl(sortedDistances[1].item.file)}`);
});
