#!/bin/bash

recipient=$1
subject="Richiesta compilazione questionario"
body="Buongiorno, a lezione mi sono dimenticato di chiedervi di compilare questo questionario rapidissimo in cui vi chiedo vicino a chi eravate seduti all'esame, purtroppo ho fatto un errore con la mappa cartacea.
Cercate di compilarlo con una certa rapidità per favore, vi lascio il link: 
http://essse3:3100/login.html"

# Crea il messaggio email
email="To: $recipient
Subject: $subject

$body"

# Invia l'email usando sendmail
echo "$email" | sendmail -F "Professore" -f "professore@xn--unts-mza.local" "$recipient"

