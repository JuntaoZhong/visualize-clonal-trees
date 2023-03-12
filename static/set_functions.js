function intersect(a, b) {
  var aa = {};
  a.forEach(function(v) { aa[v]=1; });
  return b.filter(function(v) { return v in aa; });
}

function difference(arr1, arr2){
  return arr1.filter(x => !arr2.includes(x));
}
