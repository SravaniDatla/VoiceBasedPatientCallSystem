$mongo = 'C:\Program Files\MongoDB\Server\8.2\bin\mongosh.exe'

if (!(Test-Path $mongo)) {
  Write-Error "mongosh not found at $mongo"
  exit 1
}

& $mongo --quiet --eval "const dbs=['voicebased_admin','voicebased_patient','voicebased_nurse']; const out={}; for (const n of dbs){ const d=db.getSiblingDB(n); const cols=d.getCollectionNames(); out[n]={collections:cols}; out[n].counts={}; for (const c of cols){ out[n].counts[c]=d.getCollection(c).countDocuments({}); } } printjson(out);"
