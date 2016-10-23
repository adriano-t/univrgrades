 
window.addEventListener("DOMContentLoaded", function load(event){
	window.removeEventListener("load", load, false);
	app.run();
}, false);

var app = {
	
	parent: null,
	result: null,
	
	run : function() 
	{ 
		var grades = this.loadGrades(); 
		parent = document.getElementById("grades");
		result = document.getElementById("result");  
		for(var i = 0; i < grades.length; i++)
		{
			this.addGrade(grades[i]);
		}
	},
	 
	getGrades : function()
	{
		var grades = [];
		
		for(var i = 0; i < parent.childNodes.length; i++)
		{
			var elem = parent.childNodes[i];
			grades.push ({
				name: elem.childNodes[0].value,
				grade: parseInt(elem.childNodes[1].value),
				cfu: parseInt(elem.childNodes[2].value)
			});
		}
		return grades
	},
	
	loadGrades : function()
	{
		var s = localStorage["grades"]; 
		if(s == undefined || s == "undefined")
			return [];
		
		return JSON.parse(s);
	},
	
	saveGrades : function()
	{ 
		var grades = this.getGrades();
		localStorage["grades"] = JSON.stringify(grades);
		return grades;
	},
	
	addGrade : function(grade)
	{
		var d = document.createElement('div');
		d.className = "grade";  
		var s = '<input class="name" type="text" value="'+grade.name+'" ></input>';
		s += '<input class="grade" type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" value="'+grade.grade+'"></input>';
		s += '<input class="cfu" value="'+grade.cfu+'" type="text" onkeypress="return event.charCode >= 48 && event.charCode <= 57" ></input>';
		s += ' <input class="press" type="button" value="x" onclick="app.removeGrade(this)" ></input>';
		d.innerHTML = s;
		parent.appendChild(d);
	},
	
	addEmptyGrade : function()
	{
		this.addGrade({name:"", grade:"", cfu:""});
	},
	
	removeGrade : function(element)
	{
		parent.removeChild(element.parentNode);
		this.saveGrades();
	},
	
	export : function()
	{ 
		document.getElementById("output").value = JSON.stringify(grades);
	},
	
	import : function()
	{
		var s = document.getElementById("output").value;
		var grades = [];
		var parsed = true;
		try {
			grades = JSON.parse(s); 
		}
		catch(e){ 
			grades = this.parseTable(s);
		}
		
		parent.innerHTML = "";
		for(var i = 0; i < grades.length; i++) 
			this.addGrade(grades[i]); 
	
	},
	
	parseTable : function(s)
	{
		var grades = [];
		var accepted = ["1", "2", "3"];
		var lines = s.split('\n');
		for(var i = 0; i < lines.length; i++)
		{
			var line = lines[i];
			if(accepted.indexOf(line[0]) == -1)
				continue;
			
			var t = this.splitSpecial(line);
			
			
			if(t.length == 10)
			{
				if(t[7].trim() == "APPR")
					continue;
				
				grades.push({
					name: t[2].trim(),
					grade: parseInt(t[7]),
					cfu: parseInt(t[4])
				});
			}
			
			if(t.length == 8)
			{ 
				grades.push({
					name: t[2].trim(),
					grade: 0,
					cfu: parseInt(t[4])
				});
			}
		}
		return grades;
	},
	
	splitSpecial : function(s)
	{
		var a = [];
		var separators = ['\t', '-'];
		var t = "";
		for(var i = 0; i < s.length; i++)
		{
			if(separators.indexOf(s[i]) != -1)
			{
				if(t.length > 0)
				{
					a.push(t);
					t = "";
				}
				continue;
			}
			
			t += s[i]; 
		}
		
		return a;
	},
	
	calculate : function ()
	{
		var grades = this.getGrades();
		
		var sum = 0;
		var count = 0;
		for(var i = 0; i < grades.length; i++)
		{
			if(grades[i].grade == 0)
				continue;
			
			console.log(grades[i].grade);
			sum += grades[i].grade;
			count++;
		}
		if(count > 0)
		{
			sum /= count;
			sum = sum.toFixed(2);
		}
		var finalGrade = (sum * 11/3).toFixed(2);
		
		
		var wsum = 0;
		var totCfu = 0;
		for(var i = 0; i < grades.length; i++) 
		{
			if(grades[i].grade == 0)
				continue;
			
			wsum += grades[i].grade * grades[i].cfu;
			totCfu += grades[i].cfu;
		} 
		
		if(totCfu > 0)
		{
			wsum /= totCfu;
			wsum = wsum.toFixed(2);
		}
		var finalGradeW = (wsum * 11/3).toFixed(2);
		
		var s = '<h3>Results</h3>';
		s += '<div>' + sum + ' Average</div>'; 
		s += '<div class="final-grade" >' + finalGrade + ' Final Grade</div>'; 
		s += '<hr/>';
		s += '<div>' + wsum + ' Average (with CFU)</div>'; 
		s += '<div class="final-grade" >' + finalGradeW + ' Final Grade (with CFU)</div>';   
		result.innerHTML = s;
		result.style.display = "block";
		this.saveGrades();
	},
}
