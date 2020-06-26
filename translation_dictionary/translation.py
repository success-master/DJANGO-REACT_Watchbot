from modeltranslation.translator import translator, TranslationOptions
from .models import TranslationDictionary


class TranslationDictionaryOptions(TranslationOptions):
    fields = ('translated_text',)


translator.register(TranslationDictionary, TranslationDictionaryOptions)
