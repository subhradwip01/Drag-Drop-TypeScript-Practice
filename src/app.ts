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

type Listener<T> = (items: T[]) => void


// === Classes ====
class State<T>{
    protected listeners: Listener<T>[] = [];
    addListeners(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}
// Global project state class
class ProjectState extends State<Project> {
   
    private projects: Project[] = [];
    private static instance: ProjectState

    private constructor() {
        super()
    }


    addProject(title: string, description: string, numberOfPeople: number) {
        const newPeople = new Project(
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

// Component based class
abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U
    constructor(templateId: string, hopstElementId: string, insertAtStart: boolean, elementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement
        this.hostElement = document.getElementById(hopstElementId)! as T

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as U
        if (elementId) {
            this.element.id = elementId
        }
        this.attach(insertAtStart)
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure?() : void
    abstract renderContent() : void
}

// project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {


        super("project-input", "app", true, "user-input")

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement
        this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement

        this.configure()
    }

    renderContent() {
        
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

    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
}

// project list class
class ProjectList extends Component<HTMLDivElement,HTMLElement> {
    assignedProjects: Project[] = []
    constructor(private type: 'active' | 'finished') {   
        super("project-list","app",false,`${type}-projects`)
        this.configure()
        this.renderContent()

    }

    configure() {
        projectState.addListeners((projects: Project[]) => {
            const releventProjects: Project[] = projects.filter(prj => Status[prj.status].toLowerCase() === this.type)
            this.assignedProjects = releventProjects
            this.renderPreojects()
        })
    }

    private renderPreojects() {
        if (this.assignedProjects.length > 0) {
            const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
            listEl.innerHTML = ''
            for(const projectItem of this.assignedProjects){
                console.log(projectItem)
                new ProjectItem(document.querySelector('ul')!.id,projectItem)
            }
        }
    }

    renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
    }
}

// project Item
class ProjectItem extends Component<HTMLUListElement,HTMLLIElement>{
    private project : Project

    

    constructor(hostId:string,project:Project){
        super('single-project',hostId,false,project.id.toString())
        this.project=project
        console.log(project)
        this.configure()
        this.renderContent()
    }

    configure() {
        
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent= this.project.title;
        this.element.querySelector('h3')!.textContent = this.project.people.toString();
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}


const projectInput = new ProjectInput()
const projectListActive = new ProjectList('active')
const projectListFineshed = new ProjectList('finished')

