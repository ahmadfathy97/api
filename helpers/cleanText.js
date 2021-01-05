const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM('').window)
clearModule = {}
clearModule.clean = (dirty)=>{
  let cleanText = dompurify.sanitize(dirty);
  cleanText.replace(/</gim, '&lt;').replace(/>/gim, '&gt;');
  return cleanText;
}
module.exports = clearModule
