const pattern = new URLPattern({pathname: '/users/:id'});

const url = new URL('https://api.example.com/users/42');

console.log(pattern.test(url)); // is valid or not

// parse
const res = pattern.exec(url);
console.log(res);
!!res && console.log(res.pathname.groups.id);
