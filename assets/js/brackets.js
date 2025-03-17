function addMatch() {
    let matchContainer = document.getElementById('matches');
    let match = document.createElement('div');
    match.className = 'match';
    match.innerHTML = `
        <div class="team">
                <img src="/media/img/kyoto-university.jpg" alt="Team B">
                <input class="name" type="text" value="Team B">
            </div>
            <input type="number" class="score" value="0">
            <span>vs</span>
            <input type="number" class="score" value="0">
            <div class="team">
                <img src="/media/img/rit-emblem.jpg" alt="Team B">
                <input class= "name" type="text" value="Team B">
            </div>
            <button class="remove-btn" onclick="removeMatch(this)">X</button>
    `;
    matchContainer.appendChild(match);
}

function removeMatch(button) {
    button.parentElement.remove();
}