import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { FormAutocompleteFreeSolo } from '@src/lib/components/form/FormAutocomplete';
import {
  FormResetButton,
  FormSubmitButton,
} from '@src/lib/components/form/FormButtons';
import FormCheckbox from '@src/lib/components/form/FormCheckbox';
import FormFieldSet from '@src/lib/components/form/FormFieldSet';
import FormQuestion from '@src/lib/components/form/FormQuestion';
import { FormSectionAutocomplete } from '@src/lib/components/form/FormSectionAutocomplete';
import FormSelect from '@src/lib/components/form/FormSelect';
import FormTextField from '@src/lib/components/form/FormTextField';

// export useFieldContext for use in your custom components
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    TextField: FormTextField,
    Select: FormSelect,
    Checkbox: FormCheckbox,
    AutocompleteFreeSolo: FormAutocompleteFreeSolo,
    SectionAutocomplete: FormSectionAutocomplete,
  },
  formComponents: {
    ResetButton: FormResetButton,
    SubmitButton: FormSubmitButton,
    FieldSet: FormFieldSet,
    Question: FormQuestion,
  },
});
