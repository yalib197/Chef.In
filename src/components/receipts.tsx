import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

// interfaces for setting recipe ingridiemts and detailed recipe
interface Recipe {
    recipe: {
      label: string;
      image: string;
      source: string;
      uri: string;
    };
 }
  
interface Ingredient{
    text: string;
    weight: number;
}
  
interface DetailedRecipe{
    label: string;
    image: string;
    source: string;
    uri: string;
    ingredients: Ingredient[];
    calories: any;
    totalNutrients: any; // Additional field for nutrients
}

function Receipts(){
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const closeModal = () => {
        setSelectedRecipe(null);
    };

    return(
        <section>
            <div className="container">
                <div>
                    <h1 className="mt-5 d-flex justify-content-center">Выбор блюда</h1>
                    <h3 className="mx-auto d-flex justify-content-center align-items-stretch">Выберите для себя подходящее блюдо и посмотрите его рецепт</h3>
                </div>
                <div className="d-flex justify-content-center mt-5">
                    <Search setRecipes={setRecipes} />
                </div>
                <div className='row mt-5 '>
                    {recipes.map((recipe, index) => (
                        <div className="col-md-4 mb-4" onClick={() => setSelectedRecipe(recipe)}>
                            <Receipt key={index} recipe={recipe} />
                        </div>
                    ))}
                </div>
                    <Modal 
                        isOpen={selectedRecipe !== null} 
                        onRequestClose={closeModal}
                        style={{
                            content: {
                                width: '50%', 
                                height: '80%', 
                                margin: 'auto'
                            }
                        }}
                    >
                        {selectedRecipe && <ReceiptDetails recipe={selectedRecipe} />}
                    </Modal>
            </div>
        </section>
    )
}

function Search({ setRecipes }: { setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>> }){
    const [query, setQuery] = useState<string>('');

    const searchRecipes = async () => {
        const result = await axios.get<{ hits: Recipe[] }>(
            `https://api.edamam.com/search?q=${query}&app_id=bae1892b&app_key=9d305ed0194c44322059ceed36f10bad`
        );
        setRecipes(result.data.hits);
    };

    return(
        <div className="input-group rounded  w-50">
            <input 
                type="search" 
                className="form-control rounded" 
                placeholder="Search" 
                aria-label="Search" 
                aria-describedby="search-addon" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') searchRecipes(); }}
            />
        </div>
    )
}

function Receipt({ recipe }: { recipe: Recipe }){
    return(
        <div className="card h-100">
            <img src={recipe.recipe.image} alt={recipe.recipe.label} className="card-img-top" />
            <div className="card-body">
                <h5 className="card-title">{recipe.recipe.label}</h5>
                <p className="card-text">{recipe.recipe.source}</p>
            </div>
        </div>
    )
}

function ReceiptDetails({ recipe }: { recipe: Recipe }) {
    const [detailedRecipe, setDetailedRecipe] = useState<DetailedRecipe | null>(null);
  
    useEffect(() => {
      const fetchRecipeDetails = async () => {
        try {
          const result = await axios.get<DetailedRecipe[]>(
            `https://api.edamam.com/search?r=${encodeURIComponent(recipe.recipe.uri)}&app_id=bae1892b&app_key=9d305ed0194c44322059ceed36f10bad`
          );
          setDetailedRecipe(result.data[0]);
        } catch (error) {
          console.error('Error fetching recipe details:', error);
        }
      };
  
      fetchRecipeDetails();
    }, [recipe]);
  
    return (
      <div>
        {detailedRecipe ? (
            <div>
                <div style={{ textAlign: 'center' }}>
                    <h2>{detailedRecipe.label}</h2>
                    <img src={detailedRecipe.image} alt={detailedRecipe.label} style={{ maxWidth: '100%' }} />
                    <p>Source: {detailedRecipe.source}</p>
                    <div>
                        Calories: {detailedRecipe.calories}
                    </div>
                </div>
                <div className='container'>
                    <div className="">
                        <h3>Ingredients:</h3>
                        <div style={{ textAlign: 'left', display: 'inline-block' }}>
                            {detailedRecipe.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient.text} ({ingredient.weight}g)</li>
                            ))}
                        </div>
                        <h3>Nutrients:</h3>
                        <div style={{ textAlign: 'left', display: 'inline-block' }}>
                            {/* Display nutrients */}
                            {Object.keys(detailedRecipe.totalNutrients).map((nutrientKey, index) => (
                                <li key={index}>{`${detailedRecipe.totalNutrients[nutrientKey].label}: ${detailedRecipe.totalNutrients[nutrientKey].quantity} ${detailedRecipe.totalNutrients[nutrientKey].unit}`}</li>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
}

export default Receipts