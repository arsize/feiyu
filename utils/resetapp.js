const fs = require("fs");

const firstPage = "loading";

let files = fs.readFileSync("../app.json", "utf-8");
if (files) {
  let tempObj = JSON.parse(files);
  tempObj.pages = readPages("../pages");
  //   tempObj.pages = [];
  fs.writeFileSync("../app.json", JSON.stringify(tempObj), "utf-8");
}

function readPages(startPath) {
  let tempNamesArr = [];
  let files = fs.readdirSync(startPath);
  files.map(item => {
    if (item != firstPage && item != 'component') {
      tempNamesArr.push(`pages/${item}/${item}`);
    }
  });
  tempNamesArr.unshift(`pages/${firstPage}/${firstPage}`);
  return tempNamesArr;
}
