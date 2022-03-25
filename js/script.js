const API_KEY = '8e766189dbac45729f2b9e7ab82c5ec3';
const choicesElem = document.querySelector('.js-choice');
const newsList = document.querySelector('.news-list');
const searchForm = document.querySelector('.search-form')
const title = document.querySelector('.title');

const arr = ['результат', 'результата', 'результатов']

const result = document.querySelectorAll('.result');

const declOfNum = (n, titles) => n + ' ' + titles[n % 10 === 1 && n % 100 !== 11 ?
    0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];

const choices = new Choices(choicesElem, {
    searchEnabled: false,
    itemSelectText: '',
});

const getdata = async (url) => {
    const response = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY,
        }
    });

    const data = await response.json();

    return data
};

const getDateCorrectFormat = isoDate => {
    const date = new Date(isoDate);
    const fullDate = date.toLocaleString('en-GB',{
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });

    const fullTime = date.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `<span class="news-date">${fullDate}</span> ${fullTime}`
}

const getImage = url => new Promise((resolve, reject) =>{
    const image = new Image(270, 200);

    image.addEventListener('load', () => {
        resolve(image);
    });

    image.addEventListener('error', () =>{
        image.src = 'assets/no-photo.jpg';
        resolve(image);
    });

    image.src= url || 'assets/no-photo.jpg';
    image.className= 'news-image';
    return image;
})

const renderCard = (data) => {
    newsList.textContent= '';
    data.forEach(async({urlToImage, title, url, description, publishedAt, author}) => {

        const card = document.createElement('li');
        card.className = 'news-item';

        const image = await getImage(urlToImage);
        image.alt= title;
        card.append(image);

        card.insertAdjacentHTML('beforeend', `
        <h3 class="news-title">
            <a href="${url}" class="news-link" target="_blank">${title || ''}</a>
        </h3>
        <p class="news-description">${description || ''}</p>
    <div class="news-footer">
        <time class="news-datetime" datetime="${publishedAt}">
            ${getDateCorrectFormat(publishedAt)}
        </time>
    <div class="news-author">${author || ''}</div>
    </div>
    `);

    newsList.append(card);
    })
}

const loadNews = async () => {
    const preload = document.createElement('li');
    preload.className = 'preload';
    const country = localStorage.getItem('country') || 'ru';
    choices.setChoiceByValue(country);
    const data = await getdata(`https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100`);
    renderCard(data.articles);
};

const loadSearch = async value => {
    const data = await getdata(`https://newsapi.org/v2/everything?q=${value}&pageSize=100`)
    title.textContent=`По вашему запросу "${value}" найдено ${declOfNum(data.articles.length, arr)}`
    choices.setChoiceByValue('');
    renderCard(data.articles);
};

choicesElem.addEventListener('change', (event) => {
    const value = event.detail.value;
    localStorage.setItem('country', value);
    loadNews();
});

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadSearch(searchForm.search.value);
    searchForm.reset();
})

loadNews();