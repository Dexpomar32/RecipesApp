document.addEventListener('DOMContentLoaded', () => {
    const recipesContainer = document.getElementById('recipes-container');
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');

    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token && username) {
            if (authLinks) authLinks.style.display = 'none';
            if (userInfo) userInfo.style.display = 'inline-flex';
            if (usernameDisplay) usernameDisplay.textContent = username;
        } else {
            if (authLinks) authLinks.style.display = 'inline-flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            updateAuthUI();
            alert('You have been logged out.');
            window.location.href = 'index.html';
        });
    }

    updateAuthUI();

    if (recipesContainer) {
        fetch('http://localhost:3000/api/recipes')
            .then(response => response.json())
            .then(recipes => {
                recipesContainer.innerHTML = '';
                if (recipes.length === 0) {
                    recipesContainer.innerHTML = '<p>No recipes yet. Be the first to add one!</p>';
                    return;
                }
                recipes.forEach(recipe => {
                    const recipeBlock = document.createElement('div');
                    recipeBlock.classList.add('recipe-block');
                    recipeBlock.innerHTML = `
                        <img src="${recipe.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${recipe.title}" class="recipe-image">
                        <div class="recipe-content">
                            <h2><a href="recipe.html?id=${recipe.id}">${recipe.title}</a></h2>
                            <p>${recipe.short_description || 'No description provided.'}</p>
                            <p class="author">By: ${recipe.username}</p>
                        </div>
                    `;
                    recipesContainer.appendChild(recipeBlock);
                });
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                recipesContainer.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
            });
    }
});