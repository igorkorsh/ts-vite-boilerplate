declare namespace MktoForms2 {
  export interface IMktoForms2 {
    /**
     * Loads a form descriptor from Marketo servers and creates a new Form object.
     * @param baseUrl – URL to the Marketo server instance for your subscription
     * @param munchkinId – Munchkin ID of the subscription
     * @param formId – The form version id (Vid) of the form to load
     * @param callback – A callback function to pass the constructed Form object to once it has been loaded and initialized.
     */
    loadForm(baseUrl: string, munchkinId: string, formId: string | number, callback?: () => void): void

    /**
     * Renders a lightbox style modal dialog with the Form object in it.
     * @param form – An instance of a Form object that you want to have rendered in a lightbox.
     * @param opts – An object of options passed to the lightbox object.
     */
    lightbox(form: IForm, opts?: Record<any>): void

    /**
     * Creates a new Form object from a Form Descriptor JS object. Adds a callback function that is called once all stylesheets and known lead information has been fetched and the Form object has been created.
     * @param formData – A form descriptor object, as created by the Marketo Forms V2 Editor
     * @param callback – This callback is called with a single argument, a newly created instance of Form object.
     */
    newForm(formData, callback?: (form: IForm) => void): void

    /**
     * Gets a previously created Form object by form identifier
     * @param formId – Form Vid Identifier.
     */
    getForm(formId: string | number): IForm

    /**
     * Gets a JS object containing data from the url and referrer that may be interesting for tracking purposes.
     */
    getPageFields(): Record<any>

    /**
     * Fetches an array of all form objects that have been previously constructed on the page.
     */
    allForms(): IForm | IForm[]

    /**
     * Adds a callback that is called exactly once for each form on the page that becomes "ready". Readiness means that the form exists, has been initially rendered and had its initial callbacks called. If there is already a form that is ready at the time this function is called, the passed callback is called immediately.
     * @param callback – The callback is passed a single argument, a form object.
     */
    whenReady(callback: (form: IForm) => void): IMktoForms2

    /**
     * Adds a callback that is called every time any form on the page renders. Forms are rendered when initially created, then again every time that visibility rules alter the structure of the form.
     * @param callback – The callback is passed a single argument, the form object of the form that was rendered.
     */
    onFormRender(callback: (form: IForm) => void): IMktoForms2

    /**
     * Like onFormRender, this adds a callback that is called every time a form is rendered. Additionally, this also calls the callback immediately for all forms that have already been rendered.
     * @param callback – The callback is passed a single argument, the form object of the rendered form.
     */
    whenRendered(callback: (form: IForm) => void): IMktoForms2
  }

  export interface IForm {
    /**
     * Renders a form object, returning a jQuery object wrapping a form element that contains the form. If passed a formElem, it will use that as the form element, otherwise it will create a new one.
     * @param formElem – A jQuery object-wrapped form element into which to render.
     * @returns A jQuery object-wrapped form element containing the rendered form.
     */
    render(formElem?: JQuery<HTMLFormElement>): JQuery<HTMLFormElement>

    /**
     * Gets the id of the form.
     * @returns The id of the form object that this form represents
     */
    getId(): number

    /**
     * Gets the jQuery wrapped form element of a rendered form.
     * @returns A jQuery object-wrapped form element or null if the form has not been rendered with the render() method yet.
     */
    getFormElem(): JQuery<HTMLFormElement | null>

    /**
     * Forces the form to validate, highlighting any errors that may exist and returning the result. Does not submit the form.
     * @returns Returns true if all the validators on the form passed, false otherwise.
     */
    validate(): boolean

    /**
     * Adds a validation callback that will be called anytime validation is triggered.
     * @param callback – A callback that will be triggered any time that validation occurs. The callback will be passed one parameter, a boolean stating if the validation had succeeded.
     */
    onValidate(callback: () => void): IForm

    /**
     * Triggers the form's submit event. This will start the from submit flow, performing validation, firing any onSubmit events, submitting the form, and firing any onSuccess events if form submission was successful.
     */
    submit(): IForm

    /**
     * Adds a callback that will be called when the form is submitted. This is fired when the submission begins, before the success/failure of the request is known.
     * @param callback – A function that will be called when the form is submitted. This callback will be passed one argument, this Form object.
     */
    onSubmit(callback: () => void): IForm

    /**
     * Adds a callback that will be called when the form has been successfully submitted but before the lead is forwarded to the follow up page. Can be used to prevent the lead from being forwarded to the follow up page after successful submission.
     * @param callback – A function that will be called when the form has been successfully submitted. This callback will be passed two arguments. A JS Object containing the values that were submitted and a String url of the follow up page that the user will be forwarded to, or null or empty string if there is no configured follow up page. Special behavior: If this callback returns `false` (measured using ===) then the visitor will NOT be forwarded to the follow up page and the page will NOT be reloaded. This allows the implementor to do extra processing to the follow up url, or to take action on page using JavaScript instead of leaving the page.
     */
    onSuccess(callback: (values: Record<string, any>, followUpUrl: string) => void): IForm

    /**
     * Gets or sets whether the form can be submitted. If called with no arguments, it gets the value, if called with one argument it sets the value.This can be used to prevent a form from being submitted while other criteria outside of the normal form must be fulfilled.
     * @param canSubmit – Sets the form to be submittable or non submittable.
     * @returns If called with no arguments, returns a boolean indicating if the form is submittable. If called with one argument, returns this Form Object for chaining purposes.
     */
    submittable(canSubmit?: boolean): boolean | IForm
    submitable(canSubmit?: boolean): boolean | IForm

    /**
     * Returns true if all the fields in the form have non-blank values set.
     */
    allFieldsFilled(): boolean

    /**
     * Sets values on one or more fields in the form.
     * @param vals – A JS Object. For each key/value pair in the object, the form field named key will be set to value.
     */
    setValues(vals: Record<string, any>): void

    /**
     * Gets all the values of all the fields in the form.
     * @returns A JS Object containing key/value pairs representing the names and values of the fields in the form.
     */
    getValues(): Record<string, any>

    /**
     * Adds input type=hidden fields to the form.
     * @param values – A JS Object containing key/value pairs representing the names and values of the hidden fields to add to the form.
     */
    addHiddenFields(values: Record<string, any>): void

    /**
     * jQuery style .vals() setter/getter. If called with no arguments, is equivalent to calling getValues(). If called with one argument, is equivalent to calling setValues()
     * @param values
     */
    vals(values?: Record<string, any>): void

    /**
     * Shows an error message, pointing at elem.
     * @param msg – A string containing the text of the error you want to show.
     * @param elem – The element for the error to point to. If unset, the form's submit button is used.
     */
    showErrorMessage(msg: string, elem?: JQuery): IForm
  }
}

declare const MktoForms2: MktoForms2.IMktoForms2
