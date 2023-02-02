class createPage {

// в конструкторе создаётся структура страницы
   constructor(){
      this.body = document.body;
      this.body.style.textAlign = 'center';
      this.body.style.backgroundColor = '#E5E5E5';
      this.body.style.fontFamily = 'Roboto, sans-serif'

      this.wrapper = document.querySelector('.wrapper');
      this.wrapper.style.display = 'flex'
      this.wrapper.style.justifyContent = 'center'
      this.wrapper.style.flexDirection = 'column'
      this.wrapper.style.alignItems = 'center'
      this.wrapper.style.marginTop = 62 + 'px';
      this.wrapper.style.padding = 60 +'px'
      this.wrapper.style.marginLeft = 'auto';
      this.wrapper.style.marginRight = 'auto';
      this.wrapper.style.width = 661 + 'px';
      this.wrapper.style.height = 'auto'
      this.wrapper.style.backgroundColor = '#C4C4C4';
 
      this.input = this.createElement('input', 'input-field');
      this.input.style.width = 500 + 'px';
      this.input.style.padding = 13 + 'px'
      this.input.style.height = 62 + 'px';
      this.input.style.fontSize = 48 + 'px';
      this.input.style.border = 'none';
      this.wrapper.append(this.input);
       
      this.searchList = this.createElement('ul', 'search-list');
      this.searchList.style.width = 500 + 'px'; 
      this.searchList.style.backgroundColor = '#E3E3E3';

      this.input.insertAdjacentElement('afterend', this.searchList);
 
      this.reposContainer = this.createElement('div', 'repos-list');
      this.reposContainer.style.marginTop = 45 +'px';

      this.wrapper.append(this.reposContainer);     
    }
 
   // метод для создания html-элементов

   createElement(element, className){
      const newElement = document.createElement(element);

      if (className) {
         newElement.classList.add(className);
      }
      return newElement
   }
 
   // метод для добавления и сохранения выбранного репозитория в списке

   createRepository(repository){    
      const newReposItem = this.createElement('div', `${repository.id}`);
      newReposItem.style.backgroundColor = '#E27BEB';
      newReposItem.style.display ='flex';
      newReposItem.style.justifyContent ='space-between';
      newReposItem.style.width = 500 +'px';
      newReposItem.style.border = '1px solid black';     
      const reposContent = `
         <div style="margin: 5px; font-size: 24px; text-align: left">
            <div>Name: ${repository.name}</div>
            <div>Owner: ${repository.owner.login}</div>      
            <div>Stars: ${repository.stargazers_count}</div>  
         </div>    
         <button class="${repository.id}"style = "width: 60px; height: 60px;  border: none; background-color: transparent; margin: auto 28px; cursor: pointer">                               
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
               <polygon fill="red" points="427.314 107.313 404.686 84.687 256 233.373 107.314 84.687 84.686 107.313 233.373 256 84.686 404.687 107.314 427.313 256 278.627 404.686 427.313 427.314 404.687 278.627 256 427.314 107.313" class="ci-primary"/>
            </svg>
         </button>
       `;  
      newReposItem.insertAdjacentHTML('afterbegin', reposContent);
      this.reposContainer.append(newReposItem);
      this.deleteRepoHandler(repository.id)
   }
 
   // метод для отображения результатов поиска в "выпадающем" списке

   viewRepositories(repository, reposID) {
      const reposSearchItem = this.createElement('li', `${reposID}`);
      reposSearchItem.style.listStyleType = 'none';  
      reposSearchItem.style.cursor = 'pointer';  
      reposSearchItem.style.fontSize = 30 + 'px';
      reposSearchItem.style.textAlign = 'left'; 
      reposSearchItem.style.border = '1px solid black';   
      const searchContent = `
            <span class="${repository.id}" style="display: block; margin-left: 12px; margin-bottom: 8px; pointer-events: none;">
               ${repository.name}
            </span>`;
      reposSearchItem.insertAdjacentHTML('afterbegin', searchContent);
      this.searchList.append(reposSearchItem);      
   }   

 // проверка на наличие репозитория в списке добавленных
 // если выбранный репозиторий уже добавлен - он не добавится в список снова

   checkSameRepositories(repository) {
      if (this.reposContainer.childNodes.length) { 
         for (let i = 0; i < this.reposContainer.childNodes.length; i++) {
            if (this.reposContainer.childNodes[i].classList.value == repository.id) {
               return
            }
         }
         this.createRepository(repository)
      } else {
         this.createRepository(repository)
      }
   }

   // метод для выбора репозитория из списка найденных 

   selectRepositoryHandler(item) {  

      highlightItemsHandler(this.searchList)  

      this.searchList.addEventListener('click', (event) => {
         if (event.target.classList.value == item.id){
               this.checkSameRepositories(item)
         }
         this.input.value = ''
         while (this.searchList.firstChild) {
            this.searchList.removeChild(this.searchList.lastChild);
         }
      });
   }

   // метод для удаления репозитория из списка добавленных по нажатии на кнопку "X"

   deleteRepoHandler(item){
      const reposDeleteBtns = document.querySelectorAll('button');
      for(let i = 0; i < reposDeleteBtns.length; i++){
         reposDeleteBtns[i].addEventListener('click', (event) => {
            if (event.target.closest('button').classList.value == item) {
               reposDeleteBtns[i].parentElement.remove();       
            }
          })
       }
    }
 }

 // Класс для поиска репозиториев

 
class GitHubSearch {

   constructor(page) {
      this.page = page;
      this.page.input.addEventListener('input', debounce(this.searchRepositories.bind(this), 500));
   }
 
   // Асинхронный метод для отправления запросов и получения данных из api github

   async searchRepositories() {
      const SEARCH_REPOS_COUNT = 5; 
      let inputValue  = this.page.input.value;
      if (inputValue) {
         try {
            this.clearRepositoryList();
            return await fetch(`https://api.github.com/search/repositories?q=${inputValue}&per_page=${SEARCH_REPOS_COUNT}`)
            .then((data) => { 
               data.json()
               .then(data => {
                  data.items.forEach(item => {
                     this.page.viewRepositories(item, item.id)
                     this.page.selectRepositoryHandler(item)
                  });
               })        
            })
         } catch(err){
             console.error(err);
         }
      } else {
          this.clearRepositoryList();
      }
   }

 // Метод для очищения списка найденных репозиториев

   clearRepositoryList(){
      while (this.page.searchList.firstChild) {
         this.page.searchList.removeChild(this.page.searchList.lastChild);
       }
   }
}

// Функция для стилизации элементов выпадающего списка наведении и фокусе

const highlightItemsHandler = (item, color = '#65CDF9') => {

   item.addEventListener('focus', (event) => {
      event.target.style.backgroundColor = color
   })
   item.addEventListener('blur', (event) => {
      event.target.style.backgroundColor = ''
   })
   
   item.addEventListener('mouseover', (event) => {
     event.target.style.backgroundColor = color
   })
   item.addEventListener('mouseout', (event) => {
      event.target.style.backgroundColor = ''
   })
}

 // Функция debounce для отложенных запросов 

const debounce = (fn, debounceTime) => {
   let timer = null

   return function(...args) {
       clearTimeout(timer)
   
       timer = setTimeout(() => {
           fn.apply(this, args)
       }, debounceTime)
       
   }
}
new GitHubSearch(new createPage());