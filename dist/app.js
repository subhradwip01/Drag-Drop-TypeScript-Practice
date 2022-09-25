"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function AutoBind(__, _, descriptor) {
    const originalMethode = descriptor.value;
    const adjustableDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethode.bind(this);
            return boundFn;
        }
    };
    return adjustableDescriptor;
}
function validateble(validateableInput) {
    console.log(validateableInput);
    let isValid = true;
    if (validateableInput.required) {
        isValid = isValid && validateableInput.value.toString().trim().length != 0;
    }
    if (validateableInput.minLength != null && typeof validateableInput.value === "string") {
        isValid = isValid && validateableInput.value.length >= validateableInput.minLength;
    }
    if (validateableInput.maxLength != null && typeof validateableInput.value === "string") {
        isValid = isValid && validateableInput.value.length <= validateableInput.maxLength;
    }
    if (validateableInput.min != null && typeof validateableInput.value === "number") {
        isValid = isValid && validateableInput.value >= validateableInput.min;
    }
    if (validateableInput.max != null && typeof validateableInput.value === "number") {
        isValid = isValid && validateableInput.value <= validateableInput.max;
    }
    return isValid;
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    addListeners(listenerFn) {
        this.listeners.push(listenerFn);
    }
    addProject(title, description, numberOfPeople) {
        const newPeople = new Project((new Date()).getTime(), title, description, numberOfPeople, Status.ACTIVE);
        this.projects.push(newPeople);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
    static createProjecteState() {
        if (this.instance) {
            return this.instance;
        }
        const projectState = new ProjectState();
        this.instance = projectState;
        return projectState;
    }
}
const projectState = ProjectState.createProjecteState();
var Status;
(function (Status) {
    Status[Status["ACTIVE"] = 0] = "ACTIVE";
    Status[Status["FINISHED"] = 1] = "FINISHED";
})(Status || (Status = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class Component {
    constructor(templateId, hopstElementId, insertAtStart, elementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hopstElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (elementId) {
            this.element.id = elementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
    }
    renderContent() {
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true
        };
        const describeValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };
        if (!validateble(titleValidatable) || !validateble(describeValidatable) || !validateble(peopleValidatable)) {
            alert('Invalid input, please try again');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            projectState.addProject(title, desc, people);
            this.clearInput();
        }
    }
    clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        projectState.addListeners((projects) => {
            const releventProjects = projects.filter(prj => Status[prj.status].toLowerCase() === this.type);
            this.assignedProjects = releventProjects;
            this.renderPreojects();
        });
    }
    renderPreojects() {
        if (this.assignedProjects.length > 0) {
            const listEl = document.getElementById(`${this.type}-projects-list`);
            const listeItem = document.createElement('li');
            listeItem.textContent = this.assignedProjects[this.assignedProjects.length - 1].title;
            listEl.appendChild(listeItem);
        }
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
const projectInput = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFineshed = new ProjectList('finished');
//# sourceMappingURL=app.js.map