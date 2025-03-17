document.addEventListener('DOMContentLoaded', () => {
    const limit = 9; // Number of schedules per page
    let currentPage = 1; // Current page number
    let totalSchedules = 0; // Total number of schedules

    fetch('/schedules?limit=6&offset=0')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                totalSchedules = data.length;
            }
        })
        .catch(error => console.error('Error fetching total schedules:', error));

    const fetchSchedules = async (offset) => {
        try {
            const response = await fetch(`/schedules?limit=${limit}&offset=${offset}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const schedules = await response.json();
            return schedules;
        } catch (error) {
            console.error('Error fetching schedules:', error);
            return [];
        }
    };

    const renderSchedules = async (schedules) => {
        const scheduleList = document.querySelector('.schedule-list');
        scheduleList.innerHTML = '';

        schedules.forEach(schedule => {
            const card = document.createElement('div');
            card.classList.add('schedule-card');

            const cardHeader = document.createElement('div');
            cardHeader.classList.add('card-header');

            const headerTitle = document.createElement('h2');
            headerTitle.textContent = `Match ${schedule.MatchID}`;
            cardHeader.appendChild(headerTitle);

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const matchInfo = document.createElement('p');
            matchInfo.classList.add('match-info');
            matchInfo.textContent = `${schedule.Team1Name} vs ${schedule.Team2Name}`;
            cardBody.appendChild(matchInfo);

            const timeInfo = document.createElement('p');
            timeInfo.classList.add('time');
            const date = new Date(schedule.ScheduledDate);
            const formattedTime = `${date.toLocaleDateString('en-US')} | ${date.toLocaleTimeString('en-US', { hour12: true })}`;
            timeInfo.textContent = formattedTime;
            cardBody.appendChild(timeInfo);

            card.appendChild(cardHeader);
            card.appendChild(cardBody);

            scheduleList.appendChild(card);
        });
    };

    const scheduleContainer = document.createElement('div');
    scheduleContainer.classList.add('schedule-container');

    const previousButton = document.createElement('button');
    previousButton.textContent = 'Previous';
    previousButton.classList.add('pagination-button');
    previousButton.disabled = true;

    const scheduleList = document.createElement('div');
    scheduleList.classList.add('schedule-list');

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.classList.add('pagination-button');

    scheduleContainer.appendChild(previousButton);
    scheduleContainer.appendChild(scheduleList);
    scheduleContainer.appendChild(nextButton);

    document.body.appendChild(scheduleContainer);

    fetchSchedules(0)
        .then(schedules => renderSchedules(schedules))
        .catch(error => console.error('Error fetching schedules:', error));

    nextButton.addEventListener('click', async () => {
        currentPage++;
        const offset = (currentPage - 1) * limit;
        fetchSchedules(offset)
            .then(schedules => {
                renderSchedules(schedules);
                if (offset + limit >= totalSchedules) {
                    nextButton.disabled = true;
                }
                previousButton.disabled = false;
            })
            .catch(error => console.error('Error fetching next page:', error));
    });

    previousButton.addEventListener('click', async () => {
        currentPage--;
        const offset = (currentPage - 1) * limit;
        fetchSchedules(offset)
            .then(schedules => {
                renderSchedules(schedules);
                if (currentPage === 1) {
                    previousButton.disabled = true;
                }
                nextButton.disabled = false;
            })
            .catch(error => console.error('Error fetching previous page:', error));
    });
});