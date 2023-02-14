// функції
function readFile(el) {
  const fileReader = new FileReader();
  fileReader.readAsText(el.files[0]);
  return fileReader;
}

function countSymbInText(symb, text) {
  // за допомогою методу split, розбиваємо цю строку на масив-підстрок, які відокремлені цим симвооло. 
  let count = 0;
  [...text.toLowerCase()].forEach((item) => {
    if (item === symb.toLowerCase()) {
      count++;
    }
  });
  return count;
}

function getEntropy(text) {
  let alphabet = {};
  let entropy = 0;

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (!alphabet[char]) {
      alphabet[char] = 0;
    }
    alphabet[char]++;
  }

  for (let char in alphabet) {
    let p = alphabet[char] / text.length;
    entropy = entropy - p * Math.log2(p);
  }

  return entropy;
}
//задаємо константи які будем далі рахувати 
const selectedFile = document.querySelector('.file__input'),
  probabilityPar = document.querySelector('.symbol_prob__p'),
  entropyPar = document.querySelector('.entropy__p'),
  infAmountPar = document.querySelector('.information_amount__p'),
  fsToInfAmountPar = document.querySelector('.fs_to_infam__p'),
  base64TextCodePar = document.querySelector('.base64_text__p'),
  base64EntropyPar = document.querySelector('.base64_entropy__p'),
  base64InfAmountPar = document.querySelector('.base64_information_amount__p');

selectedFile.addEventListener('change', () => {
  const file = readFile(selectedFile);

  // коли файл завантажено
  file.onload = function () {
    // отримуємо символ із вхідних даних
    const symb = document.querySelector('.symbolToFindProb').value;

    // присвоюємо текст з текстового файлу змінній
    const fileText = file.result;

    // якщо довжина символа буде 1,рахуємо вірогідність його появи у тексті
    if (symb.length === 1) {
      // ділимо кількість заданого символу у тексті на кількість всіх символів у текстовому файлу
      const symbProb = countSymbInText(symb, fileText) / fileText.length;
      probabilityPar.innerHTML = `"${symb}" probability in text ${
        selectedFile.files[0].name
      } is:  <span style="color: red">${symbProb.toFixed(3)}</span>`;
    }

    // знайдемо ентропію
    const entropy = getEntropy(fileText);
    entropyPar.innerHTML = `alphabet entropy of text ${
      selectedFile.files[0].name
    } is: <span style="color: red">${entropy.toFixed(3)}</span>`;

    // знайдемо кількість інформації тексту
    const infAmmount = entropy * fileText.length;
    infAmountPar.innerHTML = `information ammount of the text is <span style="color: red">${infAmmount.toFixed(
      3,
    )} (bits)</span>`;

    fsToInfAmountPar.innerHTML = `fileSize to information ammount:  <span style="color: red">${(
      selectedFile.files[0].size /
      (infAmmount / 8)
    ).toFixed(3)} </span>`;

    ////////////////

    // Функції для кодування тексту у base-64 формат
    // за допомогою цієї функції, отримуємо масив з закодованим у UTF-8 текст
    const utf8TextCode8UnitArr = getUtf8TextCode8UnitArr(fileText);
    // за допомогою цієї функції, отримаємо base-64 закодований текст
    const base64TextCodeString = getBase64CodeByUtf8Unit8Arr(utf8TextCode8UnitArr);

    // виводжу закодований base-64 текст
    base64TextCodePar.innerHTML = base64TextCodeString;

    //  ентропія base-64 тексту
    const base64TextEntrophy = getEntropy(base64TextCodeString);

    base64EntropyPar.innerHTML = `alphabet entropy of text ${
      selectedFile.files[0].name
    } is: <span style="color: red">${base64TextEntrophy.toFixed(3)}</span>`;

    //  кількость інформації base-64 тексту
    const base64InformationAmmount = base64TextEntrophy * base64TextCodeString.length;

    base64InfAmountPar.innerHTML = `information ammount of the text is <span style="color: red">${base64InformationAmmount.toFixed(
      3,
    )} (bits)</span>`;
  };
});





// функція предствалення коду символів base-64 за таблицею utf-8
function uint6ToB64(base64Symb) {
  if (base64Symb < 26) {
    return base64Symb + 65;
  }

  if (base64Symb < 52) {
    return base64Symb + 71;
  }

  if (base64Symb < 62) {
    return base64Symb - 4;
  }

  if (base64Symb === 62) {
    return 43;
  }

  if (base64Symb === 63) {
    return 47;
  }
  return 65;
}

// unit8Arr = UTF-8 масив
function getBase64CodeByUtf8Unit8Arr(unit8Arr) {
  // Кодування base-64 полягає в тому, що використовується 6 біт для позначення символу

  //  змінна, яка вкузує на остачу від третьої ітерації, вона потрібна, коли пройшли 3 елемента масива, бо щоб отримати base-64 код, треба взяти 3 байти та розбити їх по 6  
  let ostachaVidTreh;

  //  вихідний результат
  let base64Text = '';

  //  змінна 24 біт
  let _24bitToFill = 0;
  for (let i = 0; i < unit8Arr.length; i++) {
    ostachaVidTreh = i % 3;

    // заповнюємо 24 біт
    _24bitToFill = _24bitToFill + (unit8Arr[i] << ((16 >>> ostachaVidTreh) & 24));
    // або 24 біти заповнені
    if (ostachaVidTreh === 2 || unit8Arr.length - i === 1) {
      // отримаємо номер символу base-64 у вигляды номера символа utf-8 за допомогою функції uint6ToB64
      base64Text = base64Text + String.fromCodePoint(uint6ToB64((_24bitToFill >>> 18) & 63));
      base64Text = base64Text + String.fromCodePoint(uint6ToB64((_24bitToFill >>> 12) & 63));
      base64Text = base64Text + String.fromCodePoint(uint6ToB64((_24bitToFill >>> 6) & 63));
      base64Text = base64Text + String.fromCodePoint(uint6ToB64(_24bitToFill & 63));
      // очищаємо наші 24 біт
      _24bitToFill = 0;
    }
  }
 

  if (ostachaVidTreh === 2) {
    return base64Text;
  } else if (ostachaVidTreh === 1) {
    return base64Text.substring(0, base64Text.length - 1) + '=';
  } else {
    return base64Text.substring(0, base64Text.length - 2) + '==';
  }
}

/* UTF-8 array to JS string and JS string to UTF-8 array */
function getUtf8TextCode8UnitArr(text) {
  // масив (8біт) UTF-8 тексту
  // символ
  // довжина масива unit8Arr, яка буде рахуватись
  let unit8Arr,
    symb,
    unit8ArrLen = 0;

  // Алгоритм кодування UTF-8 стандартизований в RFC 3629 і складається з 3 етапів, але буде використано тільки 2 :

  const octetBalue = {
    till7bit: 2 ** 7,
    till11bit: 2 ** 11,
    till16bit: 2 ** 16,
    till21bit: 2 ** 21,
    till26bit: 2 ** 26,
  };

  for (let i = 0; i < text.length; i++) {
    // за допомогою методу строки codePointAt отримаємо Unicode код символу
    symb = text.codePointAt(i);

    // ...
    if (symb >= 2 ** 16) {
      i++;
    }

    /* 
    1. Визначити кількість октетів (байтів), необхідних для кодування знака. Номер знака береться з зразка Юнікоду.
    */

    // Діапазон номерів символів ||| Необхідна кількість октетів(4)
   

    unit8ArrLen =
      unit8ArrLen +
      (symb < octetBalue['till7bit'] // -128 -- 128 Повнісьтю співпадають коди
        ? 1
        : symb < octetBalue['till11bit']
        ? 2
        : symb < octetBalue['till16bit']
        ? 3
        : symb < octetBalue['till21bit']
        ? 4
        : symb < octetBalue['till26bit']
        ? 5
        : 6);
  }

  // an array of 8-bit unsigned integers
  unit8Arr = new Uint8Array(unit8ArrLen);
  console.log(unit8ArrLen);

  // 2. Встановити старші біти першого октету відповідно до необхідної кількості октетів, визначеної на першому етапі:

  
  let whileIndex = 0,
    textIndex = 0;
  while (whileIndex < unit8ArrLen) {
    symb = text.codePointAt(textIndex);
    if (symb < octetBalue['till7bit']) {
      /* one byte */
      unit8Arr[whileIndex++] = symb;
    } else if (symb < octetBalue['till11bit']) {
      /* two bytes */
      unit8Arr[whileIndex++] = 192 + (symb >>> 6);
      unit8Arr[whileIndex++] = 128 + (symb & 63);
    } else if (symb < octetBalue['till16bit']) {
      /* three bytes */
      unit8Arr[whileIndex++] = 224 + (symb >>> 12);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 6) & 63);
      unit8Arr[whileIndex++] = 128 + (symb & 63);
    } else if (symb < octetBalue['till21bit']) {
      /* four bytes */
      unit8Arr[whileIndex++] = 240 + (symb >>> 18);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 12) & 63);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 6) & 63);
      unit8Arr[whileIndex++] = 128 + (symb & 63);
      textIndex++;
    } else if (symb < octetBalue['till26bit']) {
      /* five bytes */
      unit8Arr[whileIndex++] = 248 + (symb >>> 24);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 18) & 63);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 12) & 63);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 6) & 63);
      unit8Arr[whileIndex++] = 128 + (symb & 63);
      textIndex++;
    } /* if (symb <= 0x7fffffff) */ else {
      /* six bytes */
      unit8Arr[whileIndex++] = 252 + (symb >>> 30);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 24) & 63);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 18) & 63);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 12) & 63);
      unit8Arr[whileIndex++] = 128 + ((symb >>> 6) & 63);
      unit8Arr[whileIndex++] = 128 + (symb & 63);
      textIndex++;
    }
    textIndex++;
  }

  return unit8Arr;
}
