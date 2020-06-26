from django import forms
from blog.models import Category
from django.core.exceptions import ValidationError



class SearchForm(forms.Form):
    title_contains = forms.CharField()
    title_exact_id = forms.IntegerField()
    title_or_author = forms.CharField()
    pub_data_min = forms.DateTimeField()
    pub_data_max = forms.DateTimeField()
    category = forms.ModelChoiceField(queryset=Category.objects.all())

    def stringid_error(self):
        title_exact_id = self.cleaned_data.get("title_exact_id", "")
        res = isinstance(title_exact_id, str)
        if res:
            raise forms.ValidationError('The field is a number!')
        return title_exact_id