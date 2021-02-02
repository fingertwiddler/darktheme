export default async function (o, config, offbase) {
  let res = await processContent(o, config, offbase)
  await processImages(o, config, offbase)
  return res;
}
const processImages = async (o, config, offbase) => {
  let { fs } = offbase;
  let re = /(?:!\[(.*?)\]\((.*?)\))/g
  let matches = o.content.matchAll(re)
  for(let m of matches) {
    let url = m[2]
    let match = /assets\/(.+)$/.exec(url)
    if (match && match.length > 0) {
      let b = await fs.promises.readFile(`${config.settings.SRC}/assets/${match[1]}`)
      await fs.promises.writeFile(`${config.settings.DEST}/assets/${match[1]}`, b)
    }
  }
}
// Build full HTML page for the post and write to DEST
const processContent = async (o, config, offbase) => {
  let { fs } = offbase;
  let theme = await fs.promises.readFile(config.settings.THEME.POST, "utf8")
  let template = Handlebars.compile(theme)
  let rendered = template({
    name: config.settings.NAME,
    content: o.html,
    updated: o.data.updated,
    filename: `${config.settings.SRC}/${o.filename}`,
    title: o.data.title
  }).trim()
  await fs.promises.mkdir(`${config.settings.DEST}/post`).catch((e) => { })
  await fs.promises.mkdir(`${config.settings.DEST}/post/${o.filename}`).catch((e) => { })
  await fs.promises.writeFile(`${config.settings.DEST}/post/${o.filename}/index.html`, rendered)
  return {
    html: o.html,
    content: o.content,
    data: o.data,
    filename: o.filename
  }
}
