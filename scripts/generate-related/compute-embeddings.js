const glob = require("glob-promise");
const fetch = require("node-fetch");
const fs = require("fs");
const { markdownToTxt } = require("markdown-to-txt");

const summarisePost = async (post) => {
  const OPENAI_API_KEY = process.env.npm_config_openai_api_key;
  const file = fs.readFileSync(post, "utf8");
  // remove front-matter
  const body = file.split("---")[2];
  // convert from markdown to text
  let text = markdownToTxt(body);
  text = text.replace(
    /\{% highlight [a-zA-Z]* %\}[\s\S]*\{% endhighlight %\}/g,
    " "
  );
  // remove whitespace and preserve ~2048 tokens (approx 1000 words)
  const words = text.split(/[\s]+/);
  const data = words.slice(0, 1000).join(" ");

  return await fetch(
    "https://api.openai.com/v1/engines/babbage-similarity/embeddings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + OPENAI_API_KEY,
      },
      body: JSON.stringify({
        input: data,
      }),
    }
  )
    .then((res) => {
      if(res.status !== 200) {
        console.log(res.status, res.statusText)
      }
      return res.json()
    })
    .then((json) => {
      if (json.data) {
        return json.data[0].embedding;
      } else {
        return [];
      }
    });

  // exit process
};

(async () => {
  const paths = await glob("./_posts/**/*.*").then((paths) => {
    return paths;
  });

  if (!fs.existsSync("./scripts/generate-related/data")) {
    fs.mkdirSync("./scripts/generate-related/data");
  }

  for (const path of paths) {
    const file = path.split("/").pop();
    const filename = `./scripts/generate-related/data/${file}`;

    if (!fs.existsSync(filename)) {
      await summarisePost(path).then((embedding) => {
        fs.writeFileSync(filename, JSON.stringify(embedding, null, 2));
      });
      console.log("embedding", filename);
    } else {
      console.log("skipping", filename);
    }
  }
})();
