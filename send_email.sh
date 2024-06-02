#!/bin/bash

# Verifica se l'utente ha fornito un argomento
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 email_destinatario"
  exit 1
fi

# Indirizzo email del destinatario passato come argomento
EMAIL_DESTINATARIO="$1"

# Contenuto dell'email
EMAIL_CONTENT="From: alberto@unıts.local
To: $EMAIL_DESTINATARIO
Subject: Richiesta compilazione questionario

Buongiorno, a lezione mi sono dimenticato di chiedervi di compilare questo questionario rapidissimo in cui vi chiedo vicino a chi eravate seduti all'esame, purtroppo ho fatto un errore con la mappa cartacea.
Cercate di compilarlo con una certa rapidità per favore, vi lascio il link: 
http://units/questionario/cyber.html"
