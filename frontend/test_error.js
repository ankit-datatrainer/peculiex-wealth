const fs = require('fs');
async function test() {
  const r = await fetch('http://localhost:3000/unlisted');
  const t = await r.text();
  fs.writeFileSync('error_out.html', t);
}
test();
