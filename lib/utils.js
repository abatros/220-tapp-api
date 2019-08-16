function _assert (b, o, err_message) {
  if (!b) {
    console.log(`######[${err_message}]_ASSERT=>`,o);
    console.trace(`######[${err_message}]_ASSERT`);
    throw {
      message: err_message // {message} to be compatible with other exceptions.
    }
  }
};

function xnor1(s) {
  return s.toLowerCase().replace(/\s+/g,'-'); // should remove accents too.
};


module.exports = {
  _assert, xnor1
}
