// Code goes here!
// === Utils ===
// AutoBind decoreator
function AutoBind(__: any, _: string, descriptor: PropertyDescriptor) {
    const originalMethode = descriptor.value;

    const adjustableDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethode.bind(this)
            return boundFn
        }
    }
    return adjustableDescriptor
}

//Validation
interface Validateble {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validateble(validateableInput: Validateble): boolean {
    console.log(validateableInput)
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

    return isValid
}

type Listener = (items:Project[])=>void


// === Classes ====
// Global project state class
class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState

    private constructor() {

    }

    addListeners(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, numberOfPeople: number) {
        const newPeople = new Project (
            (new Date()).getTime(),
            title,
            description,
            numberOfPeople,
            Status.ACTIVE
         )

        this.projects.push(newPeople)

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }

    static createProjecteState(): ProjectState {
        if (this.instance) {
            return this.instance;
        }
        const projectState = new ProjectState();
        this.instance = projectState;
        return projectState
    }

}

const projectState = ProjectState.createProjecteState();

// Project type class
// Status for project
enum Status {
    ACTIVE,
    FINISHED
}
class Project {
    constructor(public id: number, public title: string, public description: string, public people: number, public status: Status) { }
}

// project input class
class ProjectInput {
    templeteElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templeteElement = document.getElementById("project-input")! as HTMLTemplateElement
        this.hostElement = document.getElementById("app")! as HTMLDivElement


        const importedNode = document.importNode(this.templeteElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = "user-input"

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement
        this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement

        this.confingure()
        this.attach()
    }


    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validateble = {
            value: enteredTitle,
            required: true
        }

        const describeValidatable: Validateble = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidatable: Validateble = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (!validateble(titleValidatable) || !validateble(describeValidatable) || !validateble(peopleValidatable)) {
            alert('Invalid input, please try again');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }


    }


    @AutoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people)
            projectState.addProject(title, desc, people)
            this.clearInput()
        }
    }

    private clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }

    private confingure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
}

// project list class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[] = []
    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement
        this.hostElement = document.getElementById("app")! as HTMLDivElement


        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`


        projectState.addListeners((projects: Project[]) => {
            this.assignedProjects = projects
            this.renderPreojects()
        })

        this.attach()
        this.renderContent()

    }


    private renderPreojects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        // for(const projectItem of this.assignedProjects){
        const listeItem = document.createElement('li')
        listeItem.textContent = this.assignedProjects[this.assignedProjects.length - 1].title
        listEl.appendChild(listeItem)
        // }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`

    }

    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element)
    }
}


const projectInput = new ProjectInput()
const projectListActive = new ProjectList('active')
const projectListFineshed = new ProjectList('finished')
