import { async } from "regenerator-runtime"
import {API_URL, RESULTS_PER_PAGE} from './config.js'
import {getJson} from './helpers'

export const state = {
    recipe: {},
    search: {
        query : '',
        results: [],
        resultsPerPage: RESULTS_PER_PAGE,
        page: 1
    },
    bookmarks: []
}

export const loadRecipe = async(id) => {
    try {
        const data = await getJson(`${API_URL}${id}`)
        const {recipe} = data.data
        console.log(recipe)
        state.recipe = {
            id: recipe.id,
            title: recipe.title,
            publihser:recipe.publihser,
            sourceUrl:recipe.sourceUrl,
            image:recipe.image_url,
            servings:recipe.servings, 
            ingredients:recipe.ingredients,
            cookingTime:recipe.cooking_time 
        } 
        
        if(state.bookmarks.some((bookmark) => bookmark.id === id )){
            state.recipe.bookmark = true
        } else {
            state.recipe.bookmark = false
        }
    } catch (error) {
        throw error   // Throwing error here ion order to propagate it to the controller
    }
}


export const loadSreachResults = async(query) => {
    try {
        state.search.query = query
        const data = await getJson(`${API_URL}?search=${query}&key=e4db81ef-099e-4a7c-807b-91cec76aeb35`)
        state.search.results = data.data.recipes.map((recipe) => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image:recipe.image_url,
            }
        }) 
        state.search.page = 1
    } catch (error) {
        throw error
    }
}

// this function serves for pagination
export const getSearchResultsPage = (page = state.search.page) => {
    state.search.page = page
    const start = (page - 1 ) * state.search.resultsPerPage  //start from 1  (0* 10) = 0
    const end = page * state.search.resultsPerPage    //start from 1 (1 * 10) = 1

    return state.search.results.slice(start, end) 
}


export const updateServings = (newServings) => {
    state.recipe.ingredients.forEach((ingredient) =>{ //choosed forEach over map because we don't want to return anything
        //quantity = oldQu * newServings / oldServings
        ingredient.quantity = (ingredient.quantity * newServings) / state.recipe.servings
    })
   state.recipe.servings = newServings
}

  // storing data in the browser
const presisitBookmarks = () => {
   //transfering object to string
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = (recipe) => {
    //add to bookmarks
    if(!state.bookmarks.includes(recipe)){
       state.bookmarks.push(recipe)
    }
    
    //Mark in UI
    if(recipe.id === state.recipe.id){
        state.recipe.bookmark = true
    }
     // storing changes in the browser
      presisitBookmarks()
}

  export const deleteBookmark = (id) => {
    const index = state.bookmarks.findIndex(bookmark => bookmark.id === id)
    //filter method adds bookmarks to the list
    state.bookmarks.filter((bookmark) => {
      return bookmark.id !== id
    })

    state.bookmarks.slice(index, 1)

    if(state.recipe.id === id) state.recipe.bookmark = false
    // storing changes in the browser
    presisitBookmarks()
}

  const init = () => {
     // getting data from the browser
   const storage = localStorage.getItem('bookmarks')
      //transferring string back to object
   if(storage) state.bookmarks = JSON.parse(storage)
  }

  init()

  // clearBookmarks();
const clearBookmarks = () => {
  localStorage.clear('bookmarks');
};

  export const uploadRecipe = async function (newRecipe) {
    try {
      const ingredients = Object.entries(newRecipe)
        .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
        .map(ing => {
          const ingArr = ing[1].split(',').map(el => el.trim());
          // const ingArr = ing[1].replaceAll(' ', '').split(',');
          if (ingArr.length !== 3)
            throw new Error(
              'Wrong ingredient fromat! Please use the correct format :)'
            );
  
          const [quantity, unit, description] = ingArr;
  
          return { quantity: quantity ? +quantity : null, unit, description };
        });
  
      const recipe = {
        title: newRecipe.title,
        source_url: newRecipe.sourceUrl,
        image_url: newRecipe.image,
        publisher: newRecipe.publisher,
        cooking_time: +newRecipe.cookingTime,
        servings: +newRecipe.servings,
        ingredients,
      };
  
      const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
      state.recipe = createRecipeObject(data);
      addBookmark(state.recipe);
    } catch (err) {
      throw err;
    }
  };
  
  
