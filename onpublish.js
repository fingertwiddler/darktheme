import Handlebars from "https://jspm.dev/handlebars"
export default async function (items, config, offbase) {
  let { fs } = offbase;
  let tds = await fs.promises.readFile(config.settings.THEME.HOME, "utf8")
  let tpl = Handlebars.compile(tds)
  await fs.promises.mkdir(`${config.settings.DEST}/pages`).catch((e) => { })
  let { index, pages } = await paginator(items, tpl, config)
  for(let i=0; i<pages.length; i++) {
    await fs.promises.mkdir(`${config.settings.DEST}/pages/${i}`).catch((e) => { })
    await fs.promises.writeFile(`${config.settings.DEST}/pages/${i}/index.html`, pages[i]).catch((e) => { })
  }
  await fs.promises.writeFile(`${config.settings.DEST}/index.html`, index)
  return items
}
const paginator = (items, template, config) => {
  console.log("items = ", items)
  let pages = [];
  let counter = []
  for (let i=0; i<items.length; i+=config.settings.PAGE.CHUNK) {
    let page = items.slice(i, i + config.settings.PAGE.CHUNK)
    pages.push(page)
    counter.push({ number: i/config.settings.PAGE.CHUNK })
  }
  let res = []
  let index;
  for(let i=0; i<pages.length; i++) {
    console.log("page = ", pages[i])
    counter[i].current = true;
    let html = template({
      title: config.settings.NAME,
      base: "../../",
      items: pages[i].map((item) => {
        return {
          filename: "post/" + item.key,
          meta: item.data
        }
      }),
      pages: counter
    })
    res.push(html)

    if (i === 0) {
      index = template({
        title: config.settings.NAME,
        base: "./",
        items: pages[i].map((item) => {
          return {
            filename: "post/" + item.key,
            meta: item.data
          }
        }),
        pages: counter
      })
    }
    counter[i].current = false;
  }
  return { index: index, pages: res }
}
