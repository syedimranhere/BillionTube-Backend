const usernamevalid = (name) => {
     const usernameRegex =
          /^(?!.*[_.]{2})[a-zA-Z0-9](?:[a-zA-Z0-9._]{1,28}[a-zA-Z0-9])?$/;
     return usernameRegex.test(name);
};
const testemailvalid = (email) => {
     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
     return emailRegex.test(email);
};
const isValidFullname = (fullname) => {
     const trimmed = fullname.trim();

     // Basic sanity: Must be 2+ words, letters only, no numbers
     const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)+$/;

     // Optional advanced filters
     const blacklist = ["asdasd", "qwerty", "abcde", "xyz", "test"];

     if (
          !regex.test(trimmed) ||
          trimmed.length < 5 ||
          blacklist.includes(trimmed.toLowerCase())
     ) {
          return false;
     }

     return true;
};

export { usernamevalid, testemailvalid, isValidFullname };
