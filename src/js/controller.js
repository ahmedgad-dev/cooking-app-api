import * as model from './model';
import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import RecipeView from './views/receipeView.js';
import SearchView from './views/searchView';
import resultsView from './views/resultsView';

// This is coming from parcel to save the state in the browser
if(module.hot){
  module.hot.accept()
}

const fetchReciecpe = async() => {
  try {
      const id = window.location.hash.slice(1)
      if(!id) return
       // The loading spinner
      RecipeView.renderSpinner()
      //Loading recipe
      await model.loadRecipe(id)
      RecipeView.render(model.state.recipe)
      
    //  recipeContainer.insertAdjacentHTML('afterbegin', reciepeHTML)
  } catch(error) {
      RecipeView.renderError()
  }
}

const controlSearchResults = async(query) => {
  try {
      resultsView.renderSpinner()
      const query = SearchView.getQuery()
      if(!query) return
         
      await model.loadSreachResults(query)
      SearchView.clear()
      resultsView.render(model.getSearchResultsPage())

  } catch (error) {
     console.log(error)
  }
}

// The fetch recipe controller function is passed to the handler render in the view as argument to listen to it's change as the publisher
const init = () => {
  RecipeView.addHandlerRender(fetchReciecpe)
  SearchView.addHandlerSearch(controlSearchResults)
}

init()




