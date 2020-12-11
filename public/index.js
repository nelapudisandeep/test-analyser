// handelling opening and closing of modal
// closing the modal
let closeModalBtn = document.querySelector("#close");
let modalDiv = document.querySelector('#add');
let addLink = document.querySelector('#addLink');
let messageModal = document.querySelector('.modal');
let message = document.querySelector('.message');

closeModalBtn.addEventListener("click",e=>{
	e.preventDefault();
	modalDiv.style.display = "none";
});

addLink.addEventListener('click',e=>{
	e.preventDefault();
	modalDiv.style.display = 'flex';
});


// adding a new subject to the  database!
let form = document.querySelector("#addExamData");
let addBtn = document.querySelector(".addSubjectForm");

addBtn.addEventListener('click',e=>{
	e.preventDefault();
	let formData = new FormData(form);
	let name = formData.get('subjectname');
	let totalQuestions = formData.get('totalQuestions');
	let attemptedQuestions = formData.get('attemptedQuestions');
	let correctQuestions = formData.get('correctQuestions');
	let timeStamp = Date.now();
	let data = {
		name : name,
		totalQuestions : totalQuestions,
		attemptedQuestions : attemptedQuestions,
		correctQuestions : correctQuestions,
		date: new Date().toDateString(),
		timeStamp :  timeStamp
	}

	const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }
    // sending to server via post
    fetch('/addSubject',options)
    .then(res=>res.json())
    .then(data=>{
    	if(data.message === "success"){
    		messageModal.style.display = 'flex';
    		message.textContent = 'Successfully Added!';
    		messageModal.style.backgroundColor = "lightgreen";
    		setTimeout(()=>messageModal.style.display = "none",1500);
    		modalDiv.style.display = 'none';
    	}else{
    		messageModal.style.display = 'flex';
    		message.textContent = 'Some Error Occurred!';
    		messageModal.style.backgroundColor = "lightcoral";
    		setTimeout(()=>messageModal.style.display = "none",1500);
    		modalDiv.style.display = 'none';
    	}
    	form.reset();
    });
});

// showing details upon a click and manage buttons styles
let showDetailsBtn = document.querySelector("#showDetails");
let hideDetailsBtn = document.querySelector("#hideDetails");
let summarySection = document.querySelector(".summary-section")
showDetailsBtn.addEventListener('click',e=>{
	e.preventDefault();
	// loading the details from the server
	fetch('/showDetails')
	.then(res=>res.json())
	.then(data=>{
		getDetails(data);
		fillPlots(data);
		summarySection.style.display = 'flex';
		showDetailsBtn.style.display = 'none';
		hideDetailsBtn.style.display = "flex";
	});
});
hideDetailsBtn.addEventListener('click',e=>{
	e.preventDefault();
	summarySection.style.display = 'none';
	showDetailsBtn.style.display = 'flex';
	hideDetailsBtn.style.display = 'none';
})



window.addEventListener('load',e=>{
	e.preventDefault();
	fetch('/showDetails')
	.then(response=>response.json())
	.then(data=>{
		fillPlots(data);
	});
});




// custom functions
function getDetails(data){
	console.log(data.data);
	let dataList = data.data;
	let totalExams = data.data.length;
	let bioCount = 0;
	let phyCount = 0;
	let chemCount = 0;
	console.log(dataList.length);
	dataList.forEach( function(item) {
		if(item.name === "Biology"){
			bioCount += 1;
		}
		if(item.name === "Physics"){
			phyCount += 1;
		}
		if(item.name === "Chemistry"){
			chemCount += 1;
		}
	});

	let totalCount = document.querySelector('.totalExams');
	let totalBio = document.querySelector('.totalBio');
	let totalPhy = document.querySelector('.totalPhy');	
	let totalChe = document.querySelector('.totalChe');
	totalCount.textContent = totalExams;
	totalBio.textContent = bioCount;
	totalPhy.textContent = phyCount;
	totalChe.textContent = chemCount;	
}


function plotGraph(data,reference,plot_type,heading_label){
	let data_labels = getLabels(data.data);
	let data_points = getPoints(data.data);	
    if(data_labels.length !== 0 && data_points.length !== 0){
    	let ctx = document.getElementById(reference).getContext('2d');
		let chart = new Chart(ctx, {
		    type: plot_type,
		    data: {
		        labels: data_labels,
		        datasets: [{
		            label: heading_label,
		            backgroundColor: 'rgba(255, 99, 132,0.3)',
		            borderColor: 'rgb(255, 99, 132)',
		            data: data_points
		        }]
		    },
		});

    }
}


function getLabels(list){
	let labels = []
	list.forEach( function(item) {
		// console.log(item);
		let dateString = item.date.split(" ")[1] +" " +  item.date.split(" ")[2];
		labels.push(dateString);
	});

	return labels;

}

function getPoints(list){
	// calculating the percentage of the exam!
	let points = [];
	list.forEach( function(item) {
		console.log(item);
		let totalMarks = Number(item.totalQuestions) * 4;
		let correctMarks = Number(item.correctQuestions) * 4;
		let wrongMarks = (Number(item.attemptedQuestions) - Number(item.correctQuestions))
		let finalMarks = correctMarks - wrongMarks;
		console.log(finalMarks);
		let percentage = Math.round((finalMarks/totalMarks)*100);
		if(percentage>100){
			percentage = 100;
		}
		points.push(percentage);
	});	

	return points;
}

function getSubjectWiseData(data){
	let bio = []
	let phy = []
	let chem = []
	
	let sortedData = getSortedData(data);

	sortedData.forEach( function(item) {
		if(item.name === "Biology"){
			bio.push(item);
		}
		if(item.name === "Physics"){
			phy.push(item);
		}
		if(item.name === "Chemistry"){
			chem.push(item);
		}
	});
	return [bio,phy,chem];}

function getSortedData(data){
	let unsortedData = data.data;
	let timeStampsList = [];
	unsortedData.forEach( function(item) {
		timeStampsList.push(item.timeStamp);
	});

	timeStampsList = timeStampsList.sort();
	let sortedData = [];
	timeStampsList.forEach( function(item,index) {
		unsortedData.forEach(obj=> {
			if(item === obj.timeStamp){
				sortedData.push(obj);
			}
		});
	});
	return sortedData;
}
function fillPlots(data){
	let subjectWiseData = getSubjectWiseData(data);
		let [bio,phy,chem] = subjectWiseData;
		if(subjectWiseData.length !== 0){
			bio = {message:'Biology',data:bio};
			phy = {message:'physics',data:phy};
			chem = {message:'chemistry',data:chem};

			if(data.length !== 0){
				plotGraph(data,'myChart','line','overall Performance');
			}

			if(bio.length !== 0){
				plotGraph(bio,'myBiologyChart','bar','Biology');
			}
	
			if(phy.length !== 0){
				plotGraph(phy,'myPhysicsChart','bar','Physics');
			}

			if(chem.length !== 0){
				plotGraph(chem,'myChemistryChart','bar','Chemistry');					
			}
		}
}