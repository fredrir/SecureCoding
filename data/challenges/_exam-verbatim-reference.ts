// REFERENCE ONLY — this file is not imported anywhere.
// All verbatim data has been migrated inline into exam-questions.ts.
// Do not import or use this file in production code.

import type { MultipleChoiceOption } from "@/domain/challenge";

export interface ExamVerbatimEntry {
  readonly prompt: string;
  readonly code?: string;
  readonly options?: readonly MultipleChoiceOption[];
}

export const EXAM_VERBATIM: Record<string, ExamVerbatimEntry> = {
  "exam-2023-task-2-password-exposure": {
    "prompt": "import mysql.connector\n    class User:\n       def __init__(self, username, password):\n         self.username = username\n         self.password = password\n         self.db = mysql.connector.connect(\n            host=\"localhost\",\n            user=\"yourusername\",\n            password=\"yourpassword\",\n            database=\"yourdatabase\"\n         )\n\n          # Store the username and password in the database\n          cursor = self.db.cursor()\n          sql = \"INSERT INTO users (username, password) VALUES (%s, %s)\"\n          val = (username, password)\n          cursor.execute(sql, val)\n          self.db.commit()\n\n    1) In this example, the code is vulnerable to sensitive data exposure because it stores the user's\n    password in plain text. What measures should be taken to protect sensitive user data, such as\n    passwords, and can you explain how user passwords should be protected in the database?\n\n    2) List one other example of vulnerability that can expose sensitive information such as\n    passwords and explain briefly how the vulnerabilities could be exploited.",
    "code": ""
  },
  "exam-2023-task-3-heartbleed-cvss": {
    "prompt": "You discovered a vulnerability in the OpenSSL library and want to describe the severity of this using the Common Vulnerability Scoring System (CVSS).\n\nAn attack can be performed like this: A successful attack requires only sending a specially crafted message to a web server running OpenSSL. The attacker constructs a malformed \"heartbeat request\" with a large field length and small payload size. The vulnerable server does not validate that the length of the payload against the provided field length and will return up to 64 kB of server memory to the attacker. It is likely that this memory was previously utilized by OpenSSL. Data returned may contain sensitive information such as encryption keys or user names and passwords that could be used by the attacker to launch further attacks.\n\nChoose among the following metrics as input for the base score (you don't have to give the score itself) and write those below: Attack vector: Network (N), Adjacent (A), Local (L), Physical (P) Attack Complexity: Low (L), High (H) Privileges required: None (N), Required (R) Scope: Unchanged (U), Changed (C) Confidentially impact: High (H), Low (L), None (N) Availability Impact: High (H), Low (L), None (N) Integrity impact: High (H), Low (L), None (N)",
    "code": ""
  },
  "exam-2023-task-8-one-time-pad": {
    "prompt": "1. Explain encryption and decryption algorithm of One Time Pad (OTP). 2. Why is it considered to be \"perfectly secure\"? 3. Explain why it is insecure to use the same key to encrypt two or several messages using OTP. 4. What can an attacker do if he/she can manipulate the cipher text?",
    "code": ""
  },
  "exam-2023-task-10-penetration-testing": {
    "prompt": "Explain the concept of Penetration Testing and its practical applications in modern-day cybersecurity. Provide examples of real-world scenarios where Penetration Testing can be utilized.\n\n",
    "code": ""
  },
  "exam-2023-task-12-malicious-ai": {
    "prompt": "Your car uses a camera and AI to recognize road signs along the way. Mention at least four ways a malicious actor could attack the AI system?\n\n",
    "code": ""
  },
  "exam-2023-task-14-fix-vulnerability": {
    "prompt": "Consider the following code:\n\n     from django.db import connection\n     from django.http import HttpResponse\n     def my_view(request):\n        # Get the user's input from the request\n        user_input = request.GET.get('input')\n        # Construct a raw SQL query\n        query = \"SELECT * FROM my_table WHERE column='%s'\" % user_input\n        # Execute the query\n        cursor = connection.cursor()\n        cursor.execute(query)\n        # Process the results\n        results = cursor.fetchall()\n        # Return the results as an HTTP response\n        return HttpResponse(results)\n\n     1. What is the main vulnerability here?\n     2. How can it be exploited (give example)?\n     3. Explain how it can be fixed\n     4. Write the code that fixes it (only the lines that need fixing)\n\n",
    "code": ""
  },
  "exam-2023-case-task-4-technical-risks": {
    "prompt": "Task 4: Based on your threat model (data flow diagram), identify at least 5 technical risks. You should describe necessary assumption related to the technology. Link these to the business risks. (4 points)",
    "code": ""
  },
  "exam-2023-case-task-5-security-requirements": {
    "prompt": "Task 5. Select at least 3 technical risks and define one well-formulated security requirement for each as part of a risk mitigation strategy. (3 points)",
    "code": ""
  },
  "exam-2023-task-4-reset-token-link": {
    "prompt": "https://www.exampleTDT4237.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5crheyKiwIwk.eyJzdWIiOiIxMjM0NTY3ODkwIiwi\n\nGiven an Example of a vulnerable link:\n\n1) How can someone exploit this?\n\n2) What can you do to protect such tokens? Name at least 2 ways.",
    "code": ""
  },
  "exam-2023-task-5-logging-monitoring-fix": {
    "prompt": "LOGGING = {\n        'version': 1,\n        # Version of logging\n        'disable_existing_loggers': True,\n        #disable logging\n        # Handlers #############################################################\n        'handlers': {\n            'file': {\n                'level': 'WARNING',\n                'class': 'logging.FileHandler',\n                'filename': 'dataflair-debug.log',\n            },\n    ########################################################################\n            'console': {\n                'class': 'logging.StreamHandler',\n            },\n        },\n        # Loggers ####################################################################\n        'loggers': {\n            'django': {\n                'handlers': ['file', 'console'],\n                'level': 'LOGLEVEL',\n            },\n        },\n    }\n\n    The above code has insufficient security logging and monitoring vulnerabilities. Please propose a\n    solution (lines that needs to change and new code) to fix the vulnerabilities. Explain what you have\n    done.",
    "code": ""
  },
  "exam-2023-task-6-password-policy-code": {
    "prompt": "Suppose the password policy of a system is as follows.\n    The password should be as long as possible and must contain at least 10 characters.\n    The passwords have to contain at least one character from the following four groups:\n\n           Upper-case letters: A-Z\n           Lower-case letters: a-z\n           Numbers: 0-9\n           The following special characters: !#()+,.=?@[]_{}-\n\n    Spaces and the letters \"æ\", \"ø\" and \"å\" are not accepted\n    Your task is to develop code and configure Password Validators in Django to check the policy.\n    The following code partly takes care of the policy:\n    AUTH_PASSWORD_VALIDATORS = [\n      {\n         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',\n         'OPTIONS': {\n            'min_length': 10,\n         }\n      {\n         'NAME': 'password_validators.validators.UppercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.LowercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.SymbolValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.NoNorValidator',\n      },\n    ]\n\n    class UppercaseValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[A-Z]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 uppercase letter, A-Z.\"),\n                code='password_no_upper',\n             )\n\n    class SymbolValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[()[\\]{}|\\\\`~!@#$%^&*_\\-+=;:\\'\",<>./?]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 special character: \" +\n                 \"()[]{}|\\`~!@#$%^&*_-+=;:'\\\",<>./?\"),\n                code='password_no_symbol',\n             )\n\n    Please add your extra code and explanation that takes care of the rest below.",
    "code": ""
  },
  "exam-2023-task-7-password-weaknesses": {
    "prompt": "Passwords is one of the most common ways to authenticate users, but it suffers from a number of weaknesses. Give three examples of such weaknesses. Further, give three examples of how password based authentication can be improved.",
    "code": ""
  },
  "exam-2023-task-9-biba-bell-lapadula": {
    "prompt": "How do the Biba and Bell-LaPadula models differ in their approach to enforcing data confidentiality and integrity?",
    "code": ""
  },
  "exam-2023-task-11-social-engineering-factors": {
    "prompt": "Mention at least four psychological factors that makes us susceptible to social engineering attacks.\n\n",
    "code": ""
  },
  "exam-2023-task-13-salt-and-pepper": {
    "prompt": "Salt and pepper are used to protect against what kind of attack?\n\nWhere do you usually store your salt?\n\nWhen does the salt not work?\n\nWhere do you usually store your pepper?\n\n",
    "code": ""
  },
  "exam-2023-task-15-secure-development-practices": {
    "prompt": "You are put in charge of improving the software security of a new tech company. Briefly explain some of the practices you would want to recommend using (at least 4).\n\n",
    "code": ""
  },
  "exam-2023-task-16-symmetric-algorithm": {
    "prompt": "What is a symmetric algorithm and how can it be used in software to ensure secure data transmission?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "A symmetric algorithm is a type of encryption algorithm that uses the same key for both encryption and decryption. In software, symmetric algorithms can be used to encrypt data before it is transmitted over a network, and then decrypt it on the receiving end using the same key. This ensures that the data is secure and cannot be intercepted or read by unauthorized parties.",
        "correct": true
      },
      {
        "id": "b",
        "text": "A symmetric algorithm is a type of compression algorithm that is used to reduce the size of data before it is transmitted over a network. In software, symmetric algorithms can be used to compress large files or data sets, making them easier and faster to transmit over a network. This can help to improve network performance and reduce bandwidth usage.",
        "correct": false
      },
      {
        "id": "c",
        "text": "A symmetric algorithm is a type of routing algorithm that is used to direct network traffic between different nodes. In software, symmetric algorithms can be used to optimize network routing and ensure that data is transmitted along the most efficient path. This can help to improve network performance and reduce latency.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-17-session-hijacking": {
    "prompt": "A web developer is looking to mitigate the risk of session hijacking attacks on their website. Which of the following options would be effective in preventing session hijacking?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Setting the \"HttpOnly\" and \"secure\" flags on session cookies",
        "correct": true
      },
      {
        "id": "b",
        "text": "Deploying the website on a blockchain",
        "correct": false
      },
      {
        "id": "c",
        "text": "Signing the website certificate with a quantum-safe signature algorithm",
        "correct": false
      },
      {
        "id": "d",
        "text": "Enforcing a password policy of minimum 16 characters",
        "correct": false
      },
      {
        "id": "e",
        "text": "Ensuring that only AES is used to encrypt TLS traffic",
        "correct": false
      }
    ]
  },
  "exam-2023-task-18-buffer-overflow-protection": {
    "prompt": "What are some recommended ways of defending against buffer overflow attaks?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Use parameterized queries, limit access to memory, escape special characters, sanitize all input and ouput.",
        "correct": false
      },
      {
        "id": "b",
        "text": "Use safe functions, leverage defences in compilers, use static analysis tools, rewrite in a type-safe language.",
        "correct": true
      },
      {
        "id": "c",
        "text": "Use non-standard C functions to manipulate strings, such as strcpy and strcat. These will not lead to buffer overflow vulnerabilities found in standard C functions, such as strncpy and strncat.",
        "correct": false
      },
      {
        "id": "d",
        "text": "Close all unused ports in the firewall, reduce the number of buffers, fine programmers making coding mistakes.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-19-good-security-requirement": {
    "prompt": "What is a good security requirement?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Defining the choice of protection mechanism",
        "correct": false
      },
      {
        "id": "b",
        "text": "Stating what should be achieved, not how",
        "correct": true
      },
      {
        "id": "c",
        "text": "Stating what should not happen to the system",
        "correct": false
      },
      {
        "id": "d",
        "text": "A zero-knowledge proof",
        "correct": false
      },
      {
        "id": "e",
        "text": "A functional requirement",
        "correct": false
      }
    ]
  },
  "exam-2023-task-20-mitigating-risks-roi": {
    "prompt": "In a scenario where a cyber attack has already compromised a company's database, which of the following countermeasures would provide the least effective return of investment (ROI) in terms of mitigating the damage caused by the breach?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Investing in incident response and digital forensics capabilities",
        "correct": false
      },
      {
        "id": "b",
        "text": "Implementing network segmentation and access controls",
        "correct": false
      },
      {
        "id": "c",
        "text": "Deploying endpoint protection solutions and intrusion detection systems",
        "correct": false
      },
      {
        "id": "d",
        "text": "Conducting regular vulnerability assessments and penetration testing",
        "correct": false
      },
      {
        "id": "e",
        "text": "Pursuing legal action against the attackers.",
        "correct": true
      }
    ]
  },
  "exam-2023-task-21-csrf-code": {
    "prompt": "Consider the following code snippet:\n\n     from django.shortcuts import render\n     from django.http import HttpResponseRedirect\n     from django.urls import reverse\n     from .forms import ContactForm\n     def contact(request):\n        if request.method == 'POST':\n            form = ContactForm(request.POST)\n            if form.is_valid():\n                # Do something with the form data, like saving it to a database\n                name = request.POST.get('name')\n                email = request.POST.get('email')\n                message = request.POST.get('message')\n                return HttpResponseRedirect(reverse('contact_thanks'))\n        else:\n            form = ContactForm()\n        return render(request, 'contact.html', {'form': form})\n     def contact_thanks(request):\n        return render(request, 'contact_thanks.html')\n\n     What is the security vulnerability in this code and how can it be prevented?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The security vulnerability in this code is Cross-Site Request Forgery (CSRF), which allows an attacker to trick a user into performing unintended actions on a website. To prevent this vulnerability, the code should use CSRF tokens to ensure that form submissions are coming from legitimate sources.",
        "correct": true
      },
      {
        "id": "b",
        "text": "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
        "correct": false
      },
      {
        "id": "c",
        "text": "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-22-key-generation": {
    "prompt": "Which of the following methods is NOT a recommended approach for generating cryptographic keys?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Employing a software-based secure pseudo-random number generator with unique seeds",
        "correct": false
      },
      {
        "id": "b",
        "text": "Reusing a previously generated key for a new encryption task",
        "correct": true
      },
      {
        "id": "c",
        "text": "Collecting entropy from user-generated input, such as mouse movements or keyboard strokes.",
        "correct": false
      },
      {
        "id": "d",
        "text": "Deriving keys from a passphrase using a key derivation function",
        "correct": false
      },
      {
        "id": "e",
        "text": "Using a hardware random number generator",
        "correct": false
      }
    ]
  },
  "exam-2023-task-23-xml-injection": {
    "prompt": "Consider the following code snippet:\n\n     import xml.etree.ElementTree as ET\n     xml_string = input(\"Enter some XML: \")\n     root = ET.fromstring(xml_string)\n\n     What is the security vulnerability in this code and how can it be prevented?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
        "correct": false
      },
      {
        "id": "b",
        "text": "The security vulnerability in this code is XML injection. An attacker could send a malicious XML payload that includes an external entity reference, allowing the attacker to read arbitrary files on the server. To prevent this type of attack, we can disable external entities in the XML parser",
        "correct": true
      },
      {
        "id": "c",
        "text": "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-24-command-injection-input": {
    "prompt": "A web application allows users to search for files on the server by entering a file name into a search form. The application takes the user's input and runs it as a command on the server using the function system(). Which of the following inputs would be an example of a successful command injection attack?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "\"file.txt && echo 'hello'\"",
        "correct": false
      },
      {
        "id": "b",
        "text": "\"file.txt | grep 'secret'\"",
        "correct": false
      },
      {
        "id": "c",
        "text": "\"file.txt\"",
        "correct": true
      },
      {
        "id": "d",
        "text": "\"file.txt; rm -rf /\"",
        "correct": true
      }
    ]
  },
  "exam-2023-task-25-xss-from-database": {
    "prompt": "Consider the following code snippet:\n\nname = fetchNamefromDatabase() print('Hello, ' + name + '!')\n\nWhat is the security vulnerability in this code and how can it be prevented?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
        "correct": false
      },
      {
        "id": "b",
        "text": "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
        "correct": true
      },
      {
        "id": "c",
        "text": "The security vulnerability in this code is Cross-Site Request Forgery (CSRF), which allows an attacker to trick a user into performing unintended actions on a website. To prevent this vulnerability, the code should use CSRF tokens to ensure that form submissions are coming from legitimate sources.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-26-public-key-encryption": {
    "prompt": "In an asymmetric key system, each user has a pair of keys: a private key and a public key. To send an encrypted message to someone, what must you encrypt the message with?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Your private key",
        "correct": false
      },
      {
        "id": "b",
        "text": "The recipient's private key",
        "correct": false
      },
      {
        "id": "c",
        "text": "Your public key",
        "correct": false
      },
      {
        "id": "d",
        "text": "The recipient's public key",
        "correct": true
      }
    ]
  },
  "exam-2023-task-27-cve-cvss": {
    "prompt": "Which of following most accurately describe the purposes of CVE and CVSS?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "CVSS provides a list of top vulnerabilities. CVE is a list of scores for vulnerabilities in a system.",
        "correct": false
      },
      {
        "id": "b",
        "text": "CVSS provides a score that indicates the severity of a vulnerability. CVE integrates all the security tools available in an organization and automates incident responses.",
        "correct": false
      },
      {
        "id": "c",
        "text": "CVSS provides a score that indicates the severity of a vulnerability. CVE is a list of publicly known vulnerabilities containing ID numbers, descriptions, and references.",
        "correct": true
      },
      {
        "id": "d",
        "text": "CVSS is a 'low and slow' style of attack executed to infiltrate a network and remain inside undetected. CVE is a list of publicly known vulnerabilities containing ID numbers, descriptions, and references.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-28-cia-description": {
    "prompt": "Which of the following describes the CIA triad when applied to software security?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Confidentiality prevents unauthorized access, integrity prevents unauthorized modification, and availability deals with countermeasures to prevent denial of service to authorized users.",
        "correct": true
      },
      {
        "id": "b",
        "text": "Confidentiality deals with countermeasures to prevent denial of service to authorized users, integrity prevents unauthorized modification, and availability prevents unauthorized access.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Confidentiality prevents unauthorized access, integrity prevents unauthorized modification, and availability deals with countermeasures to prevent unauthorized access.",
        "correct": false
      },
      {
        "id": "d",
        "text": "Confidentiality prevents unauthorized modification, integrity prevents unauthorized access, and availability deals with countermeasures to prevent denial of service to authorized users.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-29-captcha": {
    "prompt": "Consider a web application that allows users to create accounts, login, and access sensitive data. Which of the following statements is true about the use of captchas and other security measures in secure coding practices?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Captchas are an effective security measure that can prevent automated attacks and protect user data, and should be used as the primary means of preventing such attacks.",
        "correct": false
      },
      {
        "id": "b",
        "text": "Captchas are effective in preventing automated attacks, but can also be bypassed by sophisticated attackers using machine learning or other advanced techniques. Therefore, they should not be used in secure coding practices.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Captchas can be effective in preventing automated attacks, but should not be relied upon as the sole means of protecting user data. Additional security measures, such as input validation, parameterized queries, and user authentication and authorization, should also be used.",
        "correct": true
      },
      {
        "id": "d",
        "text": "Captchas are unnecessary and can actually decrease the security of a website by creating a false sense of security, and should not be used in secure coding practices.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-30-crypto-concepts-false": {
    "prompt": "Which statement regarding cryptography concepts is FALSE?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Symmetric key algorithms are typically faster than asymmetric systems.",
        "correct": false
      },
      {
        "id": "b",
        "text": "Symmetric key algorithms are often referred to as public key algorithms.",
        "correct": true
      },
      {
        "id": "c",
        "text": "ECC is an example of an asymmetric public key cryptosystem.",
        "correct": false
      },
      {
        "id": "d",
        "text": "Symmetric key algorithms use the same private key for encryption and decryption.",
        "correct": false
      }
    ]
  },
  "exam-2023-task-31-buffer-overflow-code": {
    "prompt": "Consider the following code snippet:\n\n#include <stdio.h> #include <string.h> int main() { char data[5]; strcpy(data, \"Hello World\"); printf(\"%s\ \", data); return 0; }\n\nWhat is the security vulnerability in this code and how can it be prevented?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
        "correct": false
      },
      {
        "id": "b",
        "text": "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
        "correct": false
      },
      {
        "id": "c",
        "text": "The security vulnerability in this code is buffer overflow, which allows an attacker to overwrite memory beyond the bounds of the buffer and potentially execute arbitrary code or cause a denial of service. To prevent this vulnerability, the code should use safe functions, such as strncpy() and strlcpy(), to copy strings and ensure that the buffer is not overflowed.",
        "correct": true
      }
    ]
  },
  "exam-2023-task-32-symmetric-encryption-disadvantage": {
    "prompt": "Which of the following is a disadvantage of the symmetric encryption compared to asymmetric encryption?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Key management",
        "correct": true
      },
      {
        "id": "b",
        "text": "Key strength",
        "correct": false
      },
      {
        "id": "c",
        "text": "Key size",
        "correct": false
      },
      {
        "id": "d",
        "text": "Speed",
        "correct": false
      }
    ]
  },
  "exam-2023-task-33-threat-agents": {
    "prompt": "Which of the following statements best describe the characteristics of different threat agents?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "CEO criminals are highly skilled and motivated to spy on their own employees. Geeks are individuals who perform hacking activities for personal gain or to cause harm. Script Kiddies are typically young or inexperienced individuals who use pre-packaged tools or scripts to launch simple attacks on websites or online services.",
        "correct": false
      },
      {
        "id": "b",
        "text": "Swamps are associated with online harassment and bullying. Often very skilled and with many resources. Crooks are motivated by financial gain and may target individuals or organizations to steal sensitive data or extort money. Cyber warriors are independent hackers that attack other systems mainly based on their cultural beliefs.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Terrorists have limited skills, but can be highly motivated and have enough resources to finance others to perform cyber attacks. Geeks are individuals who perform hacking activities legally and with the intention of improving security. Hackers-for-hire are individuals or groups who offer their services to conduct cyber attacks on behalf of others.",
        "correct": true
      },
      {
        "id": "d",
        "text": "Insiders know the systems well and have access, and therefore do not many resources to perform attacks against their own organisation. Terrorists use methods such as penetration testing, social engineering, and vulnerability scanning. Spooks are hired by organizations to identify and exploit vulnerabilities in their systems in order to improve security.",
        "correct": false
      },
      {
        "id": "e",
        "text": "Geeks are driven by curiosity, have technical skills and unlimited resources. Cyber warriors are malicious individuals or groups who seek to exploit vulnerabilities in systems for personal gain or to cause harm. Insiders may be motivated by financial gain, revenge, or ideology and can be particularly difficult to detect and prevent.",
        "correct": false
      },
      {
        "id": "f",
        "text": "Question 1",
        "correct": false
      },
      {
        "id": "g",
        "text": "Case description: Video recordings of football games",
        "correct": false
      },
      {
        "id": "h",
        "text": "A local (Norwegian) football club wants to use video recordings of their matches to analyse their play and stream to people not able to attend the games. The team has bought camera equipment and cloud storage from a UK supplier, and pays a monthly subscription fee for them to manage the video recordings. The club wants to offer these services to teams with players ranging from ages 14-17 (youth teams) and 18+ (adults).",
        "correct": false
      },
      {
        "id": "i",
        "text": "The season is about to start when somebody informs the club that video can be regarded as personal information, and explicit consent needs to be obtained from anyone appearing in the video recordings. The club contacts you to help them out developing an appropriate consent system. The system should also be used to inform spectators (through a privacy notice):",
        "correct": false
      },
      {
        "id": "j",
        "text": "•   That video recording is taking place. •   Which areas will be recorded. •   What the video will be used for. •   Who can see it. •   How it is stored and for how long. •   Who to contact for more information. •   How to object.",
        "correct": false
      },
      {
        "id": "k",
        "text": "During the first meeting with the club you come up with the following business goals for a web-based system:",
        "correct": false
      },
      {
        "id": "l",
        "text": "•   BG1: Make it easy to give spectators access to the privacy note (e.g., through QR codes). •   BG2: Obtain consent from both home and away teams before recording starts (all players). •   BG3: Know who has been recorded. •   BG4: Keep evidence of the consent. •   BG5: Allow consent to be withdrawn. •   BG6: If the players are below 15 years of age, parents or guardians need to provide the consent.",
        "correct": false
      },
      {
        "id": "m",
        "text": "Part 1 tasks (26 points in total) In this part you continue with a risk-based assessment based on RMF (Risk Management Framework) of the web-based system described in the case. You can disregard the video recording part of the system, as this is not something you will develop.",
        "correct": false
      },
      {
        "id": "n",
        "text": "If you feel that any of the tasks require information that you do not find in the text, then you should",
        "correct": false
      },
      {
        "id": "o",
        "text": "•   Document the necessary assumptions (e.g. technology, standards, software, design choices.) •   Explain why you need them Your answers should be brief and to the point.",
        "correct": false
      },
      {
        "id": "p",
        "text": "Task 1: Identify the business assets (at least 4) and stakeholders that you find most relevant. (3 points)",
        "correct": false
      },
      {
        "id": "q",
        "text": "Task 2: Identify business risks for the system (at least 5) and link them to the business goals. You may define additional business goals you see fit. (3 points)",
        "correct": false
      },
      {
        "id": "r",
        "text": "Task 3: Describe textually the main elements of a data flow diagram (DFD) representing the system (you can sketch one on paper and then describe the elements you have drawn). You can assume that a Single Sign On solution will be used to simplify authentication. Describe possible attack points in relation to the DFD. (5 points) Task 4: Based on your threat model (data flow diagram), identify at least 5 technical risks. You should describe necessary assumption related to the technology. Link these to the business risks. (4 points)",
        "correct": false
      },
      {
        "id": "s",
        "text": "Task 5. Select at least 3 technical risks and define one well-formulated security requirement for each as part of a risk mitigation strategy. (3 points)",
        "correct": false
      },
      {
        "id": "t",
        "text": "Task 6: A typical Norwegian football club is run by volunteers, often with limited knowledge about GDPR and technical skills, and usually with a tight budget. Write a short reflection about GDPR challenges you think such organisations tend to face. Who should be responsible in case of a privacy breach? Why is it so important to take GDPR seriously when recording children? (5 points)",
        "correct": false
      },
      {
        "id": "u",
        "text": "Task 7: Write a short reflection where you argue that the club should disregard streaming the games to remote spectators, but rather focus on keeping the video for local analysis only. (3 points)",
        "correct": false
      }
    ]
  },
  "exam-2023-case-task-1-assets-stakeholders": {
    "prompt": "Task 1: Identify the business assets (at least 4) and stakeholders that you find most relevant. (3 points)",
    "code": ""
  },
  "exam-2023-case-task-2-business-risks": {
    "prompt": "Task 2: Identify business risks for the system (at least 5) and link them to the business goals. You may define additional business goals you see fit. (3 points)",
    "code": ""
  },
  "exam-2023-case-task-3-dfd-attack-points": {
    "prompt": "Task 3: Describe textually the main elements of a data flow diagram (DFD) representing the system (you can sketch one on paper and then describe the elements you have drawn). You can assume that a Single Sign On solution will be used to simplify authentication. Describe possible attack points in relation to the DFD. (5 points)",
    "code": ""
  },
  "exam-2023-case-task-6-gdpr-volunteer-club": {
    "prompt": "Task 6: A typical Norwegian football club is run by volunteers, often with limited knowledge about GDPR and technical skills, and usually with a tight budget. Write a short reflection about GDPR challenges you think such organisations tend to face. Who should be responsible in case of a privacy breach? Why is it so important to take GDPR seriously when recording children? (5 points)",
    "code": ""
  },
  "exam-2023-case-task-7-disregard-streaming": {
    "prompt": "Task 7: Write a short reflection where you argue that the club should disregard streaming the games to remote spectators, but rather focus on keeping the video for local analysis only. (3 points)",
    "code": ""
  },
  "exam-2024-task-2-injection-impact": {
    "prompt": "Suppose your system takes users' input and can be exposed to injection attacks. List and explain at least four strategies to mitigate the impact of injection attack compromises. (4 points)",
    "code": ""
  },
  "exam-2024-task-4-ai-and-security": {
    "prompt": "What is the difference between malicious abuse of AI and malicious use of AI? Give examples of both.",
    "code": ""
  },
  "exam-2024-task-5-demonstrate-data-protection": {
    "prompt": "How can a controller demonstrate data protection? Give at least 5 examples.",
    "code": ""
  },
  "exam-2024-task-7-circuit-breaker": {
    "prompt": "What is the purpose of the circuit breaker pattern in the context of microservice architecture security?",
    "code": ""
  },
  "exam-2024-task-8-bell-lapadula": {
    "prompt": "1) In the Bell-LaPadula model, what does the * property mean? 2) What about STRONG * ?",
    "code": ""
  },
  "exam-2024-task-13-supply-chain-security": {
    "prompt": "What are the four steps of software supply chain attacks and what are the corresponding countermeasure strategies? (4 points)",
    "code": ""
  },
  "exam-2024-task-14-microservice-attack-area": {
    "prompt": "What are potential attack areas of microservices deployed on a cloud? (4 points)",
    "code": ""
  },
  "exam-2024-case-task-5-use-case-actors": {
    "prompt": "Task 5: In the use case diagram on the next page, you can see use cases and undefined actors. Define at least 5 suitable actors and describe how they should be connected referring to the use case labels (you can add more actors if needed). (3 points)",
    "code": ""
  },
  "exam-2024-case-task-8-technical-risk-evaluation": {
    "prompt": "Task 8: Based on the threat models, identify at least 5 technical risks and evaluate them. You should describe necessary assumption related to the technology. (3 points)",
    "code": ""
  },
  "exam-2024-task-3-otp-security-integrity": {
    "prompt": "1. Explain encryption and decryption algorithm of One Time Pad (OTP). (1 point) 2. Explain why it is insecure to use the same key to encrypt two or several messages using OTP. (2 points) 3. Explain why OTP cannot guarantee integrity (1 point)",
    "code": ""
  },
  "exam-2024-task-6-password-policy-code": {
    "prompt": "Suppose the password policy of a system is as follows.\n\n           The password is between 8-10 characters long\n           The password contains characters from 3 of the following 4 categories:\n                standard uppercase characters (A - Z)\n                standard lowercase characters (a - z)\n                numbers (0 - 9)\n                symbols: only from among ! % - _ + = [ ] { } : , . ? < > ( ) ;\n           The password does not contain information identical to user's first and last name\n           The password does not contain common passwords\n           Spaces and the letters \"æ\", \"ø\" and \"å\" are not accepted\n\n    Your task is to develop code and configure Password Validators in Django to check the policy.\n\n    Here is an old version of the code that partly takes care of the policy:\n\n    AUTH_PASSWORD_VALIDATORS = [\n      {\n         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',\n         'OPTIONS': {\n           'min_length': 10,\n         }\n      {\n         'NAME': 'password_validators.validators.UppercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.LowercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.SymbolValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.NoNorValidator',\n      },\n    ]\n\n    class UppercaseValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[A-Z]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 uppercase letter, A-Z.\"),\n                code='password_no_upper',\n             )\n\n    class SymbolValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[()[\\]{}|\\\\`~!@#$%^&*_\\-+=;:\\'\",<>./?]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 special character: \" +\n                 \"()[]{}|\\`~!@#$%^&*_-+=;:'\\\",<>./?\"),\n                code='password_no_symbol',\n             )\n\n    Your task is to update the old code and add the necessary code to check the password policy. (4 points)\n    (Note: Syntax errors are allowed, especially if you explain the code.)",
    "code": ""
  },
  "exam-2024-task-9-concept-drift": {
    "prompt": "What is the concept drift challenge within AI? Give an example.",
    "code": ""
  },
  "exam-2024-task-10-pentest-tools": {
    "prompt": "What are the pros and cons of penetration testing tools?",
    "code": ""
  },
  "exam-2024-task-11-social-engineering": {
    "prompt": "Mention principles of persuasion that can be used for social engineering attacks.",
    "code": ""
  },
  "exam-2024-task-12-logging-vulnerability-fix": {
    "prompt": "production.py\n     1 from app.settings.common import *\n     2 from decouple import config, Csv\n     3\n     4\n     5 # Email admins and managers\n     6 # https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/#admins-and-managers\n     7 ADMINS = config('ADMINS', default=[('Admin', 'admin@forum.securecodewarrior.com')], cast=Csv())\n     8 MANAGERS = config('MANAGERS', default=[('moderator', 'moderator@forum.securecodewarrior.com')], cast=Csv()\n     9\n     10\n     11 # SECURITY WARNING: don't run with debug turned on in production!\n     12 DEBUG = False\n     13\n     14 # https://docs.djangoproject.com/en/2.1/ref/settings/#allowed-hosts\n     15 ALLOWED_HOSTS = ['forum.securecodewarrior.com', ]\n     16\n     17\n     18 # SSL/HTTPS\n     19 # https://docs.djangoproject.com/en/2.1/topics/security/#ssl-https\n     20\n     21 SECURE_SSL_REDIRECT = True\n     22\n     23 SESSION_COOKIE_SECURE = True\n     24\n     25 # Cross Site Request Forgery\n     26 CSRF_COOKIE_SECURE = True\n     27 CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default=[], cast=Csv())\n     28\n     29 SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')\n     30\n     31\n     32 # https://docs.djangoproject.com/en/2.1/topics/security/\n     33 # HSTS\n     34 SECURE_HSTS_SECONDS = 5 * 60\n     35 SECURE_HSTS_PRELOAD = True\n     36 SECURE_HSTS_INCLUDE_SUBDOMAINS = True\n     37\n     38 # https://docs.djangoproject.com/en/2.1/ref/clickjacking/\n     39 X_FRAME_OPTIONS = 'DENY'\n     40\n     41 SECURE_CONTENT_TYPE_NOSNIFF = True\n     42\n     43 SECURE_BROWSER_XSS_FILTER = True\n     44\n     45 # Sessions\n     46 # https://docs.djangoproject.com/en/2.1/ref/settings/#sessions\n     47 SESSION_COOKIE_AGE = 24 * 60 * 60 # 24 hours, in seconds\n     48 SESSION_EXPIRE_AT_BROWSER_CLOSE = True\n     49\n     50\n     51 # Database\n     52 # https://docs.djangoproject.com/en/2.1/ref/settings/#databases\n     53\n     54 DATABASES = {\n     55     'default': {\n     56         'ENGINE': 'django.db.backends.postgresql',\n     57         'NAME': config('DATABASE_NAME'),\n     58         'USER': config('DATABASE_USER'),\n     59         'PASSWORD': config('DATABASE_PASSWORD'),\n     60         'HOST': config('DATABASE_HOST'),\n     61         'PORT': config('DATABASE_PORT'),\n     62     }\n     63 }\n     64\n     65\n     66 # Email configuration\n     67 # https://docs.djangoproject.com/en/2.1/ref/settings/#default-from-email\n     68\n     69 DEFAULT_FROM_EMAIL = 'support@forum.securecodewarrior.com'\n     70 SERVER_EMAIL = 'admin@forum.securecodewarrior.com'\n     71\n     72\n     73 # https://docs.djangoproject.com/en/2.1/ref/settings/#email-backend\n     74 EMAIL_BACKEND = config('EMAIL_BACKEND')\n     75 EMAIL_HOST = config('EMAIL_HOST')\n     76 EMAIL_PORT = config('EMAIL_PORT', cast=int)\n     77 EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)\n     78 EMAIL_HOST_USER = config('EMAIL_HOST_USER')\n     79 EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')\n     80\n     81\n     82 # https://docs.djangoproject.com/en/2.1/ref/settings/#file-upload-permissions\n     83 FILE_UPLOAD_PERMISSIONS = config('FILE_UPLOAD_PERMISSIONS', default=0o640, cast=oct)\n\n     Code snippet of common.py\n     1 # Logging\n     2 # https://docs.djangoproject.com/en/2.1/topics/logging/#configuring-logging\n\n3\n4 # Disable Django's logging setup\n5 LOGGING_CONFIG = None\n6\n7 LOGLEVEL = config('LOGLEVEL', default='INFO')\n8\n9 # https://docs.djangoproject.com/en/2.1/topics/logging/#custom-logging-configuration\n10 logging.config.dictConfig({\n11     'version': 1,\n12     'disable_existing_loggers': False,\n13     'formatters': {\n14         'default': {\n15              # exact format is not important, this is the minimum information\n16              'format': '%(asctime)s %(name)-12s %(levelname)-8s %(message)s',\n17         },\n18         'django.server': DEFAULT_LOGGING['formatters']['django.server'],\n19     },\n20     'handlers': {\n21         # console logs to stderr\n22         'console': {\n23              'class': 'logging.StreamHandler',\n24              'formatter': 'default',\n25         },\n26         'file': {\n27              'level': 'WARNING',\n28              'class': 'logging.FileHandler',\n29              'filename': os.path.join(BASE_DIR, 'debug.log'),\n30         },\n31         'django.server': DEFAULT_LOGGING['handlers']['django.server'],\n32     },\n33     'loggers': {\n34         # default for all undefined Python modules\n35         '': {\n36            'level': LOGLEVEL,\n37              'handlers': ['console', 'file'],\n38         },\n39         # Prevent noisy modules from logging\n40         'noisy_module': {\n41              'level': 'ERROR',\n42              'handlers': ['console'],\n43              'propagate': False,\n44         },\n45         # Default runserver request logging\n46         'django.server': DEFAULT_LOGGING['loggers']['django.server'],\n47     },\n48 })\n\nThe code snippet common.py has vulnerabilities related to security logging and monitoring. The code in production.py\nprovides some background information.\n- Explain which lines in common.py are vulnerable and why they are vulnerable. (2 points)\n- Explain how to fix the vulnerabilities in the common.py. It is necessary to provide code to show how to fix it. (2 points) (Note:\nSyntax errors are allowed, especially if you explain the code.)",
    "code": ""
  },
  "exam-2024-task-15-privacy-motivation": {
    "prompt": "What is the biggest motivation for software companies to work with privacy?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The respect of their customers",
        "correct": false
      },
      {
        "id": "b",
        "text": "Catching criminals",
        "correct": false
      },
      {
        "id": "c",
        "text": "This is what management cares about",
        "correct": false
      },
      {
        "id": "d",
        "text": "Big legal fines",
        "correct": true
      },
      {
        "id": "e",
        "text": "This is what developers care about",
        "correct": false
      }
    ]
  },
  "exam-2024-task-16-cryptography-keys": {
    "prompt": "Which of the following methods is NOT a recommended approach for generating cryptographic keys?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Reusing a previously generated key for a new encryption task",
        "correct": true
      },
      {
        "id": "b",
        "text": "Collecting entropy from user-generated input, such as mouse movements or keyboard strokes.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Deriving keys from a passphrase using a key derivation function",
        "correct": false
      },
      {
        "id": "d",
        "text": "Employing a software-based secure pseudo-random number generator with unique seeds",
        "correct": false
      },
      {
        "id": "e",
        "text": "Using a hardware random number generator",
        "correct": false
      }
    ]
  },
  "exam-2024-task-17-threat-modeling": {
    "prompt": "What is the best way of performing threat modeling?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Attack trees were the first and is still the most recognized way of modeling threats.",
        "correct": false
      },
      {
        "id": "b",
        "text": "It is better to create multiple threat modeling representations because there is no single ideal view",
        "correct": true
      },
      {
        "id": "c",
        "text": "DFD is the most widely used threat modeling technique and should therefore be used",
        "correct": false
      },
      {
        "id": "d",
        "text": "You should create your own threat modeling technique that is tailored for the job.",
        "correct": false
      },
      {
        "id": "e",
        "text": "Misuse case diagrams were invented at NTNU and considered to be the most useful way.",
        "correct": false
      }
    ]
  },
  "exam-2024-task-18-injection-code": {
    "prompt": "cart.html\n     1 <!DOCTYPE html>\n     2 <html lang=\"en\">\n     3 <head>\n     4    <meta charset=\"UTF-8\">\n     5    <title> User Cart </title>\n     6 </head>\n     7 <body>\n     8      {% for item in items %}\n     9\n     10          Product Name: {{ item.product_name }}<br>\n     11          Product Id : {{ item.product_id }}<br>\n     12          Transaction Id : {{ item.transaction }}<br>\n     13          Price : {{ item.price }}<br>\n     14\n     15     {% endfor %}\n     16 <br><br><b><a href=\"{% url 'shops:logout' %}\"> logout</a></b>\n     17 </body>\n     18 </html>\n\n     models.py\n     1 from __future__ import unicode_literals\n     2\n     3 from django.db import models\n     4 from django.contrib.auth.models import User\n     5\n     6\n     7 # Model for shopping order transactions.\n     8 class ShoppingTransaction(models.Model):\n     9     order_id = models.CharField(max_length=20)\n     10    date = models.DateTimeField()\n     11    total_amount = models.DecimalField(max_digits=7, decimal_places=2)\n     12    user = models.ForeignKey(User)\n     13\n     14    def __str__(self):\n     15        return self.order_id\n     16\n     17\n     18 # Model for products purchased by a customer.\n     19 class TransactionDetail(models.Model):\n     20    product_id = models.CharField(max_length=20)\n     21    product_name = models.CharField(max_length=40)\n     22    transaction = models.ForeignKey(ShoppingTransaction)\n     23    price = models.DecimalField(max_digits=7, decimal_places=2)\n\n     views.py\n     1 from django.shortcuts import render\n     2 from django.http import HttpResponseRedirect\n     3 from django.contrib.auth import authenticate, login, logout\n     4 from django.contrib.auth.decorators import login_required\n     5 from django.core.urlresolvers import reverse\n     6 from django.contrib import messages\n     7\n     8 from shops.models import TransactionDetail, ShoppingTransaction\n     9 from shops.forms import LoginForm\n     10\n     11\n     12 # User Login\n     13 def user_login(request):\n     14     # Checking the request method\n     15     if request.method == 'POST':\n     16         # Create a form instance and populate it with data from the request:\n     17         form = LoginForm(request.POST)\n     18         # Checking if all the form fields value meet the set criteria\n     19         if form.is_valid():\n     20              # Fetching the username and passwords from POST methods\n     21              user_name = form.cleaned_data['username']\n     22              pass_word = form.cleaned_data['password']\n     23              # Authenticating the user\n     24              user = authenticate(username=user_name, password=pass_word)\n     25              # Checking if the user is successfully authenticated\n     26              if user is not None:\n     27                  # Login the user and creating a user session\n     28                  if user.is_active:\n     29                      login(request, user)\n     30                      return HttpResponseRedirect(reverse('shops:order'))\n     31                  else:\n     32                      messages.error(request, 'User is disabled.')\n     33              else:\n     34                  form = LoginForm()\n     35                  # Flashing a message on incorrect login credentials\n     36                  messages.error(request, 'Incorrect Login Details .. Please try again')\n     37     else:\n     38         # Creating a form instance\n     39         form = LoginForm()\n     40\n     41     return render(request, 'shops/login.html', {'form': form})\n     42\n\n     43\n     44 # Fetching all the orders for that user\n     45 @login_required(login_url='/shops/login/')\n     46 def user_order_view(request):\n     47        data_set = ShoppingTransaction.objects.filter(user=request.user)\n     48        return render(request, 'shops/order.html', {'orders': data_set})\n     49\n     50\n     51 # Order details page\n     52 @login_required(login_url='/shops/login/')\n     53 def user_cart_view(request, transaction_id):\n     54        data_set = TransactionDetail.objects.filter(transaction=transaction_id)\n     55        return render(request, 'shops/cart.html', {'items': data_set})\n     56\n     57\n     58 # Logout Page\n     59 @login_required(login_url='/shops/login/')\n     60 def user_logout(request):\n     61       logout(request)\n     62       return render(request, 'shops/logout.html', {})\n     In the above code snippets, which lines are vulnerable?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "models.py: 22-23",
        "correct": false
      },
      {
        "id": "b",
        "text": "views.py: 54-55",
        "correct": true
      },
      {
        "id": "c",
        "text": "cart.html: 10-11",
        "correct": false
      },
      {
        "id": "d",
        "text": "models.py: 11-12",
        "correct": false
      }
    ]
  },
  "exam-2024-task-19-cia-triad": {
    "prompt": "Which of the following principles is part of the CIA triad?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Auditability: Enables monitoring and recording of system activities for security analysis.",
        "correct": false
      },
      {
        "id": "b",
        "text": "Availability: Ensures that authorized users can access data when needed.",
        "correct": true
      },
      {
        "id": "c",
        "text": "Accountability: refers to the principle that an individual is entrusted to safeguard and control equipment, keying material, and information.",
        "correct": false
      },
      {
        "id": "d",
        "text": "Attacks: involve direct actions against a system or network.",
        "correct": false
      },
      {
        "id": "e",
        "text": "Authentication: Verifies the identity of users or processes.",
        "correct": false
      }
    ]
  },
  "exam-2024-task-20-authorization-code": {
    "prompt": "models.py\n     1 from __future__ import unicode_literals\n     2\n     3 from django.db import models\n     4 from django.contrib.auth.models import User\n     5\n     6\n     7 # Model for team participating in competition.\n     8 class Team(models.Model):\n     9    name = models.CharField(max_length=15)\n     10\n     11    def __str__(self):\n     12        return self.name\n     13\n     14\n     15 # Model for gamer profiles.\n     16 class GamerProfile(models.Model):\n     17    alias_name = models.CharField(max_length=40)\n     18    game_name = models.CharField(max_length=30)\n     19    score = models.IntegerField()\n     20    team = models.ForeignKey(Team)\n     21    user = models.ForeignKey(User)\n     22\n     23    def __str__(self):\n     24        return self.alias_name\n\n     views.py\n     1 from django.shortcuts import render\n     2 from django.contrib.auth import authenticate, login, logout\n     3 from django.core.urlresolvers import reverse\n     4 from django.http import HttpResponseRedirect, HttpResponse\n     5 from django.contrib import messages\n     6 from django.contrib.auth import decorators\n     7 from django.shortcuts import get_object_or_404\n     8\n     9 from games.models import GamerProfile, Team\n     10 from games.forms import LoginForm\n     11\n     12\n     13 # User login process\n     14 def user_login(request):\n     15    # Checking the request method\n     16    if request.method == 'POST':\n     17        # Create a form instance and populate it with data from the request\n     18        form = LoginForm(request.POST)\n     19        if form.is_valid():\n     20            # Fetching the username and passwords from POST methods\n     21            user_name = form.cleaned_data['username']\n     22            pass_word = form.cleaned_data['password']\n     23            # Authenticating the user\n     24            user = authenticate(username=user_name, password=pass_word)\n     25            # Checking if the user is successfully authenticated\n     26            if user is not None:\n     27                # Login the user and creating a user session\n     28                if user.is_active:\n     29                     login(request, user)\n     30                     return HttpResponseRedirect(reverse('games:dashboard'))\n     31                else:\n     32                     messages(request, 'User is disabled.')\n     33            else:\n     34                form = LoginForm()\n     35                messages.error(request, 'Incorrect Login Details. Please try ag ain')\n     36    else:\n     37        # Instantiating empty form\n     38        form = LoginForm()\n     39\n     40    return render(request, 'games/login.html', {'form': form})\n     41\n     42\n     43 # User gaming dashboard\n     44 @decorators.login_required(login_url='/games/login/')\n     45 def dashboard(request):\n     46    team = get_object_or_404(Team, user=request.user)\n     47    team_gamers = GamerProfile.objects.filter(team=team.team)\n     48    return render(request, 'games/dashboard.html', {'team_gamers': team_gamers, })\n     49\n     50\n     51 # User Team members\n     52 @decorators.login_required(login_url='/games/login/')\n     53 def gamer_profile(request, gamer_id):\n     54    gamer_details = get_object_or_404(GamerProfile, pk=gamer_id)\n     55    return render(request, 'games/gamer_details.html', {'gamer': gamer_details, })\n     56\n     57\n     58 # User logout\n     59 @decorators.login_required(login_url='/games/login/')\n     60 def log_out(request):\n\n61    logout(request)\n62    return render(request, 'games/logout.html', {})\n\nsettings.py\n1 # -*- coding: utf-8 -*-\n2\n3 #\n4 # settings file for production environment\n5 #\n6 # This settings provides the MINIMUM level of security. Additional\n7 # settings may be used to hardening the system (not added here because of\n8 # potential compatibility issues with the software), like, for example:\n9 #\n10 # - SECURE_PROXY_SSL_HEADER\n11 # - SECURE_HSTS_SECONDS\n12 # - SECURE_HSTS_INCLUDE_SUBDOMAINS\n13 # - SECURE_SSL_REDIRECT\n14 # - SECURE_SSL_HOST\n15 #\n16\n17\n18 from __future__ import unicode_literals\n19\n20 import os\n21\n22 from django.core.exceptions import ImproperlyConfigured\n23\n24 INSTALLED_APPS = [\n25    'django.contrib.admin',\n26    'django.contrib.auth',\n27    'django.contrib.contenttypes',\n28    'django.contrib.sessions',\n29    'django.contrib.messages',\n30    'django.contrib.staticfiles',\n31    'games.apps.GamesConfig',\n32 ]\n33\n34 ROOT_URLCONF = 'website.urls'\n35\n36 WSGI_APPLICATION = 'website.wsgi.application'\n37\n38 DEBUG = False\n39\n40 ALLOWED_HOSTS = [\n41    'randomapp.securecodewarrior.com'\n42 ]\n43\n44 CSRF_COOKIE_SECURE = True\n45 SESSION_COOKIE_SECURE = True\n46\n47 try:\n48    SECRET_KEY = os.environ['DJANGO__SECRET_KEY']\n49\n50    DATABASES = {\n51        'default': {\n52            'ENGINE': 'django.db.backends.postgresql',\n53            'NAME': os.environ['DJANGO__DB_NAME'],\n54            'USER': os.environ['DJANGO__DB_USER'],\n55            'PASSWORD': os.environ['DJANGO__DB_PASSWORD'],\n56            'HOST': os.environ['DJANGO__DB_HOST'],\n57            'PORT': os.environ['DJANGO__DB_PORT'],\n58        }\n59    }\n60\n61 except KeyError, ex:\n62    key = ex.args[0]\n63    raise ImproperlyConfigured(\"The environment variable {0} \"\n64                               \"was not found and is required\".format(key))\n65\n66 MIDDLEWARE_CLASSES = [\n67    'django.middleware.security.SecurityMiddleware',\n68    'django.contrib.sessions.middleware.SessionMiddleware',\n69    'django.middleware.common.CommonMiddleware',\n70    'django.middleware.csrf.CsrfViewMiddleware',\n71    'django.contrib.auth.middleware.AuthenticationMiddleware',\n72    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',\n73    'django.contrib.messages.middleware.MessageMiddleware',\n74    'django.middleware.clickjacking.XFrameOptionsMiddleware',\n75 ]\n76\n77 TEMPLATES = [\n78    {\n79        'BACKEND': 'django.template.backends.django.DjangoTemplates',\n80        'DIRS': [],\n81        'APP_DIRS': True,\n82        'OPTIONS': {\n83            'context_processors': [\n84                'django.template.context_processors.debug',\n85                'django.template.context_processors.request',\n86                'django.contrib.auth.context_processors.auth',\n87                'django.contrib.messages.context_processors.messages',\n\n88             ],\n89         },\n90    },\n91 ]\n92\n93 AUTH_PASSWORD_VALIDATORS = [\n94    {\n95         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',\n96    },\n97    {\n98         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',\n99    },\n100     {\n101        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',\n102     },\n103     {\n104         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',\n105     },\n106 ]\n107\n108 STATIC_URL = '/static/'\n\nIn the above code snippets, which lines of code are vulnerable?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "settings.py:71-72",
        "correct": false
      },
      {
        "id": "b",
        "text": "models.py: 20-21",
        "correct": false
      },
      {
        "id": "c",
        "text": "views.py:54-54",
        "correct": true
      },
      {
        "id": "d",
        "text": "views.py:46-47",
        "correct": false
      }
    ]
  },
  "exam-2024-task-21-crypto-code": {
    "prompt": "1 from __future__ import unicode_literals\n     2\n     3 import hashlib\n     4 from datetime import date\n     5 from datetime import timedelta\n     6\n     7 from django.db import models\n     8 from django.conf import settings\n     9\n     10\n     11 class Payment(models.Model):\n     12    \"\"\"\n     13    Represents a payment.\n     14\n     15    It could be pending to be processed (`accepted` is None)\n     16    or already processed (`accepted` is True or False).\n     17    \"\"\"\n     18    description = models.CharField(max_length=50)\n     19    payment_from = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='+')\n     20    payment_to = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='+')\n     21    amount = models.DecimalField(max_digits=9, decimal_places=2)\n     22    accepted = models.NullBooleanField(null=True)\n     23\n     24\n     25 class InvalidSecurityCode(Exception):\n     26    \"\"\"The provided security code is not valid\"\"\"\n     27\n     28\n     29 class SecurityCodeManager(models.Manager):\n     30    @staticmethod\n     31    def encrypt_security_code(plaintext_security_code):\n     32        \"\"\"\n     33        Encrypt the provided plain-text security code\n     34        :param plaintext_security_code: plain-text security code\n     35        :return: crypted security code\n     36        \"\"\"\n     37        assert isinstance(plaintext_security_code, unicode)\n     38\n     39        hash_inst = hashlib.md5(plaintext_security_code.encode('utf-8'))\n     40        return hash_inst.hexdigest()\n     41\n     42    def check_security_code(self, plaintext_security_code):\n     43        \"\"\"\n     44        Verifies if the provided plain-text security code\n     45        exists in the database, and isn't too old.\n     46\n     47        Raises an exception if the code isn't valid.\n     48\n     49        :param plaintext_security_code: the security code in plain text\n     50                                         format (as entered by the user)\n     51        :raise InvalidSecurityCode: if code is not valid\n     52        \"\"\"\n     53        crypted_code = self.encrypt_security_code(plaintext_security_code)\n     54\n     55        today = date.today()\n     56        valid_from_date = today - timedelta(days=15)\n     57\n     58        # control date and ignore time, we no need such precision\n     59        qs = self.filter(created_at__date__gte=valid_from_date)\n     60        qs = qs.filter(crypted_password=crypted_code)\n     61\n     62        if not qs.exists():\n     63            raise InvalidSecurityCode()\n     64\n     65    def delete_old_security_codes(self):\n     66        \"\"\"\n     67        Delete old security codes from the database.\n     68\n     69        This should be called periodically to avoid having\n     70        old codes in the database.\n     71        \"\"\"\n     72        today = date.today()\n     73        valid_from_date = today - timedelta(days=15)\n     74\n     75        self.filter(created_at__date__lt=valid_from_date).delete()\n     76\n     77\n     78 class SecurityCode(models.Model):\n     79    \"\"\"\n     80    Represents a security code to be entered by the user\n     81    to prove the authenticity when processing a payment.\n     82    \"\"\"\n     83    created_at = models.DateTimeField(auto_now_add=True)\n     84    crypted_password = models.CharField(max_length=1000, db_index=True)\n     85\n     86    objects = SecurityCodeManager()\n     87\n     88    def set_security_code(self, plaintext_code):\n\n     89              \"\"\"\n     90              Crypt and set the security code in this instance, based on the\n     91              provided plain-text security code.\n     92\n     93              Use of this method must call save() to update the database.\n     94              \"\"\"\n     95\n     96              if len(set(list(plaintext_code.lower()))) < 10:\n     97                  raise InvalidSecurityCode(\"The provided text is \"\n     98                                            \"not valid and can not be used as \"\n     99                                            \"a security code\")\n     100\n     101              self.crypted_password = SecurityCodeManager.encrypt_security_code(\n     102                  plaintext_code)\n     103\n     104        def __str__(self):\n     105            return \"Security code {} ({})\".format(self.id, self.created_at)\n\n     Which lines of the above code snippet are vulnerable?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "39-40",
        "correct": true
      },
      {
        "id": "b",
        "text": "83-84",
        "correct": false
      },
      {
        "id": "c",
        "text": "None of the above listed lines are vulnerable.",
        "correct": false
      },
      {
        "id": "d",
        "text": "72-75",
        "correct": false
      }
    ]
  },
  "exam-2024-task-22-blacklisting-principle": {
    "prompt": "Which security guiding principle is related to the blacklisting countermeasure?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Practice defense in depth",
        "correct": false
      },
      {
        "id": "b",
        "text": "Keep it simple",
        "correct": false
      },
      {
        "id": "c",
        "text": "Promote privacy",
        "correct": false
      },
      {
        "id": "d",
        "text": "Keep it difficult",
        "correct": false
      },
      {
        "id": "e",
        "text": "Be reluctant to trust",
        "correct": true
      }
    ]
  },
  "exam-2024-task-23-command-injection-code": {
    "prompt": "index.html\n     1 <!DOCTYPE html>\n     2 <html lang=\"en\">\n     3 <head>\n     4     <meta charset=\"UTF-8\">\n     5     <title>Random App</title>\n     6 </head>\n     7 <body>\n     8 {# Message notifications #}\n     9    {% if messages %}\n     10        <ul class=\"messages\">\n     11               {% for message in messages %}\n     12                  <li {% if message.tags %} class=\"{{ message.tags }}\"{% endif %} >{{ message }}</li>\n     13               {% endfor %}\n     14        </ul>\n     15    {% endif %}\n     16    {# Message notifications end #}\n     17    <h4>Check host status</h4>\n     18          <form method=\"POST\" action=\"{% url 'host:index' %}\">\n     19              {% csrf_token %}\n     20               {{ form }}\n     21           <br />\n     22              <input type=\"submit\" value=\"submit\" />\n     23          </form><br>\n     24    <hr>\n     25    <br>\n     26    {% if request.POST %}\n     27        <h4>{{ output }}</h4>\n     28    {% endif%}\n     29    <br>\n     30\n     31 </body>\n     32 </html>\n\n     forms.py\n     1 from django import forms\n     2\n     3\n     4 # Form architecture to find host status\n     5 class HostCheckForm(forms.Form):\n     6     ip = forms.CharField()\n\n     views.py\n     1 from django.shortcuts import render\n     2\n     3 from host.forms import HostCheckForm\n     4\n     5 from os import popen2\n     6\n     7\n     8 # View method to check host status\n     9 def index(request):\n     10     output = None\n     11     # Checking request method\n     12     if request.method == 'POST':\n     13         # Initialising form with POST request\n     14         form = HostCheckForm(request.POST)\n     15         # Validating form inputs\n     16         if form.is_valid():\n     17             cmd_string = 'ping -c 3 ' + form.cleaned_data['ip']\n     18             process_output = popen2(cmd_string, mode='r', bufsize=-1)\n     19            output = process_output.__getitem__(1).read()\n     20     else:\n     21         # Initialising empty form\n     22         form = HostCheckForm()\n     23\n     24     return render(request, 'host/index.html', {'form': form, 'output': output})\n\n     In the above code snippets, which lines have vulnerability?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "forms.py:5-6",
        "correct": false
      },
      {
        "id": "b",
        "text": "views.py:14-14",
        "correct": false
      },
      {
        "id": "c",
        "text": "views.py:16-19",
        "correct": true
      },
      {
        "id": "d",
        "text": "index.html:26-28",
        "correct": false
      }
    ]
  },
  "exam-2024-task-24-cvss-name": {
    "prompt": "What does CVSS stand for in the context of cybersecurity?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Cyber Vulnerability Secret Service",
        "correct": false
      },
      {
        "id": "b",
        "text": "Critical Vulnerability Scoring System",
        "correct": false
      },
      {
        "id": "c",
        "text": "Cybersecurity Vulnerability Severity Scale",
        "correct": false
      },
      {
        "id": "d",
        "text": "Common Vulnerability Security System",
        "correct": false
      },
      {
        "id": "e",
        "text": "Common Vulnerability Scoring System",
        "correct": true
      }
    ]
  },
  "exam-2024-task-25-xss-mark-safe-code": {
    "prompt": "index.html\n     1 <!DOCTYPE html>\n     2 <html>\n     3     <head>\n     4          <title>Random App</title>\n     5     </head>\n     6\n     7     <body>\n     8    {# Message notifications #}\n     9    {% if messages %}\n     10       <ul class=\"messages\">\n     11               {% for message in messages %}\n     12                  <li>{% if message.tags %} class=\"{{ message.tags }}\"{% endif %}>{{ message }}</li>\n     13               {% endfor %}\n     14       </ul>\n     15    {% endif %}\n     16    {# Message notifications end #}\n     17    <h4>Team Collaborator Calendar</h4>\n     18          <form method=\"POST\" action=\"{% url 'teams:index' %}\">\n     19              {% csrf_token %}\n     20               Email : {{form.email}}\n     21         {{ form.email.errors }}\n     22         Scheduled Task : {{form.event}}\n     23         {{ form.event.errors }}\n     24       Date : {{form.date}}\n     25         {{ form.date.errors }}\n     26\n     27\n     28             <br />\n     29              <input type=\"submit\" value=\"submit\" />\n     30          </form><br>\n     31    <hr>\n     32    <br>\n     33    {% if calendar_events %}\n     34       <h4>Latest events</h4>\n     35       {% for event in calendar_events %}\n     36       <b>Email: </b> {{ event.email }}<br>\n     37       <b>Task:</b> {{ event.event }}<br>\n     38       <b>Date:</b> {{ event.date }}<br><br>\n     39       {% endfor %}\n     40    {% endif%}\n     41\n     42    <br>\n     43 <script src=\"//code.jquery.com/jquery-1.10.2.js\"></script>\n     44 <script src=\"//code.jquery.com/ui/1.11.4/jquery-ui.js\"></script>\n     45 <script>\n     46   $(function() {\n     47     $( \".datepicker\" ).datepicker({\n     48       changeMonth: true,\n     49       changeYear: true,\n     50       yearRange: \"1900:2012\",\n     51\n     52     });\n     53   });\n     54   </script>\n     55     </body>\n     56 </html>\n\n     models.py\n     1 from __future__ import unicode_literals\n     2\n     3 from django.db import models\n     4\n     5\n     6 # Model for Calendar App\n     7 class Calendar(models.Model):\n     8     email = models.EmailField()\n     9     date = models.DateField()\n     10    event = models.CharField(max_length=1024)\n\n     views.py\n     1 from django.core.urlresolvers import reverse_lazy\n     2 from django.shortcuts import render\n     3 from django.utils.html import mark_safe\n     4 from django.views.generic import CreateView, TemplateView\n     5 # mark_safe tells django templates that a string should be used AS IS\n     6 from teams.forms import CalendarForm\n     7 from teams.models import Calendar\n     8\n     9\n     10 # View for scheduling task form and render scheduled task\n     11 class Index(CreateView):\n     12     form_class = CalendarForm\n     13     model = Calendar\n     14     template_name = 'teams/index.html'\n     15     success_url = reverse_lazy('teams:success')\n     16\n     17     # Custom function\n\n     18     def get_all_events(self):\n     19         temp_calendar_events = []\n     20         for events in Calendar.objects.all().order_by('-date'):\n     21             events.event = mark_safe(events.event)\n     22             temp_calendar_events.append(events)\n     23         return temp_calendar_events\n     24\n     25     # Method for form/POST data\n     26    def get_context_data(self, **kwargs):\n     27         context = super(Index, self).get_context_data(**kwargs)\n     28         final_events = self.get_all_events()\n     29         context['calendar_events'] = final_events\n     30         return context\n     31\n     32\n     33 # View for redirection\n     34 class Success(TemplateView):\n     35     template_name = 'teams/success.html'\n\n     In the above code snippets, which lines are vulnerable?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "model.py:10-10",
        "correct": false
      },
      {
        "id": "b",
        "text": "index.html:22-23",
        "correct": false
      },
      {
        "id": "c",
        "text": "views.py:20-22",
        "correct": true
      },
      {
        "id": "d",
        "text": "views.py:28-28",
        "correct": false
      }
    ]
  },
  "exam-2024-task-26-public-key-false-statements": {
    "prompt": "Which statements regarding public key cryptography algorithm are FALSE? 1. Message sender and receiver use identical keys when they use public key cryptography algorithms. 2. The public key cryptography algorithms are usually open to public. 3. Stream cipher is a public key cryptography algorithm. 4. ECDSA is not a public key cryptography algorithm.",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "1, 2, and 4",
        "correct": false
      },
      {
        "id": "b",
        "text": "1, 3, and 4",
        "correct": true
      },
      {
        "id": "c",
        "text": "2, 3, and 4",
        "correct": false
      },
      {
        "id": "d",
        "text": "All of them",
        "correct": false
      }
    ]
  },
  "exam-2024-task-27-buffer-overflow-inputs": {
    "prompt": "Which of these kinds of inputs can cause a buffer overflow? 1. An environment variable 2. String input from the user 3. A single integer 4. A floating point number 5. File input",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "2 and 5",
        "correct": false
      },
      {
        "id": "b",
        "text": "All of the above",
        "correct": true
      },
      {
        "id": "c",
        "text": "1 and 2",
        "correct": false
      },
      {
        "id": "d",
        "text": "3 and 4",
        "correct": false
      }
    ]
  },
  "exam-2024-task-28-good-security-requirement": {
    "prompt": "Which of these is a good security requirement?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The system must have good usability",
        "correct": false
      },
      {
        "id": "b",
        "text": "End user data should be encrypted at rest",
        "correct": true
      },
      {
        "id": "c",
        "text": "The system shall work just like the previous one, but on a new platform",
        "correct": false
      },
      {
        "id": "d",
        "text": "The system should be free from vulnerabilities",
        "correct": false
      },
      {
        "id": "e",
        "text": "The system shall encrypt all confidential data using the RSA algorithm",
        "correct": false
      }
    ]
  },
  "exam-2024-task-29-cookie-token-issue": {
    "prompt": "What is the security issue of cookie-based tokens?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Web browser can not save the cookie value",
        "correct": false
      },
      {
        "id": "b",
        "text": "Cookies are unhealthy for the end user",
        "correct": false
      },
      {
        "id": "c",
        "text": "Web browser can not see the cookie expiration time",
        "correct": false
      },
      {
        "id": "d",
        "text": "Server does not see which domain sends the cookie",
        "correct": true
      },
      {
        "id": "e",
        "text": "Server can not save the cookie value",
        "correct": false
      }
    ]
  },
  "exam-2024-task-30-static-analysis": {
    "prompt": "Which approach does NOT belong to static code analysis for vulnerability detection?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Control flow analysis",
        "correct": false
      },
      {
        "id": "b",
        "text": "Pattern matching",
        "correct": false
      },
      {
        "id": "c",
        "text": "Penetration testing",
        "correct": true
      },
      {
        "id": "d",
        "text": "Taint analysis",
        "correct": false
      }
    ]
  },
  "exam-2024-task-31-transparency-countermeasure": {
    "prompt": "Which is NOT a transparency countermeasure of software supply chain security?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Dependabot",
        "correct": false
      },
      {
        "id": "b",
        "text": "Version Locking",
        "correct": true
      },
      {
        "id": "c",
        "text": "Sigstore",
        "correct": false
      },
      {
        "id": "d",
        "text": "Software Bill of Materials (SBOM)",
        "correct": false
      }
    ]
  },
  "exam-2024-task-32-load-balancer-countermeasure": {
    "prompt": "What is the countermeasure to defend against attacks targeting the load balancer in the microservice architecture?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Service-to-service authentication",
        "correct": false
      },
      {
        "id": "b",
        "text": "Rate throttling",
        "correct": true
      },
      {
        "id": "c",
        "text": "Secure container",
        "correct": false
      },
      {
        "id": "d",
        "text": "Service-level authorization",
        "correct": false
      },
      {
        "id": "e",
        "text": "Question 1",
        "correct": false
      },
      {
        "id": "f",
        "text": "Case description: Risk assessment of a risk assessment tool for Air Traffic Management (ATM)",
        "correct": false
      },
      {
        "id": "g",
        "text": "SESAR Joint Undertaking defines, develops and deploys technologies to transform air traffic management (ATM) in Europe. These technologies are known as solutions and are developed in numerous projects under det SESAR JU programme. Solutions can be used to manage conventional aircrafts, drones, air taxis and vehicles flying at higher altitudes, and need to undergo risk assessments at various stages of their development lifecycle (i.e. concept development, lab experiments, prototypes in realistic environments, proven system in operation development). One of the solutions is a cyber security risk assessment methodology, that is to be applied to the other solutions in order to derive their security requirements and maintain an up-to-date risk picture. A part of this solution is a web-based tool that is intended to make risk assessments easier for other air traffic management solutions. This includes defining scope and goals, identifying assets, threats and vulnerabilities, describing and evaluating risks and deriving security requirements. Since this web- based tool is considered to be a solution by itself, you will also need to perform a risk assessment of it (effectively a risk assessment of a risk assessment tool).",
        "correct": false
      },
      {
        "id": "h",
        "text": "You have been given the following business goals:",
        "correct": false
      },
      {
        "id": "i",
        "text": "•   BG1: Support the ATM risk assessment methodology. •   BG2: A user-friendly web-interface that supports various stakeholders involved. •   BG3: Able to retrieve assets from a digital catalogue of reusable items (e.g. flight data, satellite datalink, primary radar, air traffic controller, passengers.). •   BG4: Preserve confidentiality of the assessments of the SESAR solutions. •   BG5: Allow sharing of risk assessment information between authorized people (involved in an assessment).",
        "correct": false
      },
      {
        "id": "j",
        "text": "Part 1 tasks (30 points in total) In this part you will perform tasks related web-based tool from the case description.",
        "correct": false
      },
      {
        "id": "k",
        "text": "If you feel that any of the tasks require information that you do not find in the text, then you should:",
        "correct": false
      },
      {
        "id": "l",
        "text": "•   Document the necessary assumptions (e.g. technology, standards, software, design choices.) •   Explain why you need them.",
        "correct": false
      },
      {
        "id": "m",
        "text": "Your answers should be brief and to the point.",
        "correct": false
      },
      {
        "id": "n",
        "text": "Task 1: As part of defining the scope, list at least five impact dimensions you consider relevant for this assessment. (3 points)",
        "correct": false
      },
      {
        "id": "o",
        "text": "Task 2: What kind of people/stakeholders would you involve in the assessment? Explain why. (3 points)",
        "correct": false
      },
      {
        "id": "p",
        "text": "Task 3: What kind of access control model would you recommend for this solution? (2 points)",
        "correct": false
      },
      {
        "id": "q",
        "text": "Task 4: Identify 5 assets (something of value that needs protection) related to the tool. (3 points)",
        "correct": false
      },
      {
        "id": "r",
        "text": "Task 5: In the use case diagram on the next page, you can see use cases and undefined actors. Define at least 5 suitable actors and describe how they should be connected referring to the use case labels (you can add more actors if needed). (3 points)",
        "correct": false
      },
      {
        "id": "s",
        "text": "Task 6: Define at least 5 corresponding misuse case elements and describe how they should be connected to the use cases (you use the labels as a references). (3 points)",
        "correct": false
      },
      {
        "id": "t",
        "text": "Task 7: The last page shows a DFD. Explain the different types of elements in the diagram. Identify possible attack points in relation to the DFD elements and describe at least 5 threats according to STRIDE. (4 points)",
        "correct": false
      },
      {
        "id": "u",
        "text": "Task 8: Based on the threat models, identify at least 5 technical risks and evaluate them. You should describe necessary assumption related to the technology. (3 points)",
        "correct": false
      },
      {
        "id": "v",
        "text": "Task 9: Select at least 3 technical risks and define one well-formulated security requirement for each. (3 points)",
        "correct": false
      },
      {
        "id": "w",
        "text": "Task 10: Write a short reflection on which threat agents you consider to be significant for this tool. Justify these using principles from attacker-centric threat modelling. (3 points)",
        "correct": false
      }
    ]
  },
  "exam-2024-case-task-1-impact-dimensions": {
    "prompt": "Task 1: As part of defining the scope, list at least five impact dimensions you consider relevant for this assessment. (3 points)",
    "code": ""
  },
  "exam-2024-case-task-2-stakeholders": {
    "prompt": "Task 2: What kind of people/stakeholders would you involve in the assessment? Explain why. (3 points)",
    "code": ""
  },
  "exam-2024-case-task-3-access-control-model": {
    "prompt": "Task 3: What kind of access control model would you recommend for this solution? (2 points)",
    "code": ""
  },
  "exam-2024-case-task-4-assets": {
    "prompt": "Task 4: Identify 5 assets (something of value that needs protection) related to the tool. (3 points)",
    "code": ""
  },
  "exam-2024-case-task-6-misuse-cases": {
    "prompt": "Task 6: Define at least 5 corresponding misuse case elements and describe how they should be connected to the use cases (you use the labels as a references). (3 points)",
    "code": ""
  },
  "exam-2024-case-task-7-dfd-stride-threats": {
    "prompt": "Task 7: The last page shows a DFD. Explain the different types of elements in the diagram. Identify possible attack points in relation to the DFD elements and describe at least 5 threats according to STRIDE. (4 points)",
    "code": ""
  },
  "exam-2024-case-task-9-security-requirements": {
    "prompt": "Task 9: Select at least 3 technical risks and define one well-formulated security requirement for each. (3 points)",
    "code": ""
  },
  "exam-2024-case-task-10-threat-agent-reflection": {
    "prompt": "Task 10: Write a short reflection on which threat agents you consider to be significant for this tool. Justify these using principles from attacker-centric threat modelling. (3 points)",
    "code": ""
  },
  "exam-2025-task-2-xss": {
    "prompt": "What does XSS stand for? (1 point) What kind of attack is this? (1 point) Explain the difference between Reflected vs. Stored XSS. (2 points)\n\n",
    "code": ""
  },
  "exam-2025-task-3-debugging-proxy": {
    "prompt": "What do you use a web debugging proxy for in the context of software security? (2 points) Name at least two such tools. (2 points)\n\n",
    "code": ""
  },
  "exam-2025-task-4-authentication": {
    "prompt": "What is authentication? (1 point) What are the three ways of performing it? Give one example of each. (3 points)\n\n",
    "code": ""
  },
  "exam-2025-task-5-logging-monitoring": {
    "prompt": "One of the OWASP Top 10 items is \"Security logging and monitoring failures\" (A09:2021). Give at least four examples of how this can happen (the lecture covered six). (4 points)\n\n",
    "code": ""
  },
  "exam-2025-task-7-impact-mitigation": {
    "prompt": "Suppose your system takes users' input and can be exposed to injection attacks. List and explain at least three strategies to mitigate the impact of injection attack compromises. (3 points)\n\n",
    "code": ""
  },
  "exam-2025-task-8-llm-security": {
    "prompt": "List at least three possible security and privacy risks of using Large Language Model for software development and code generation. (3 points)\n\n",
    "code": ""
  },
  "exam-2025-task-11-data-privacy-principles": {
    "prompt": "Data Privacy Principles are essential for GDPR, list at least four data privacy principles. (4 points)\n\n",
    "code": ""
  },
  "exam-2025-task-17-cvss": {
    "prompt": "Which of the following statements about the Common Vulnerability Scoring System (CVSS) is correct?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "CVSS scores are determined solely based on the complexity of the attack.",
        "correct": false
      },
      {
        "id": "b",
        "text": "CVSS is used to measure the potential impact of a vulnerability on the confidentiality, integrity, and availability of a system.",
        "correct": true
      },
      {
        "id": "c",
        "text": "CVSS scores software risks on a scale from 0 to 10.",
        "correct": false
      },
      {
        "id": "d",
        "text": "CVSS does not consider the environmental factors when scoring a vulnerability.",
        "correct": false
      }
    ]
  },
  "exam-2025-task-30-dpia": {
    "prompt": "DPIA as defined in GDPR article 35 stands for:",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Data Processing Impact Assurance",
        "correct": false
      },
      {
        "id": "b",
        "text": "Data Processing Impact Agreement",
        "correct": false
      },
      {
        "id": "c",
        "text": "Displaced People in Action",
        "correct": false
      },
      {
        "id": "d",
        "text": "Data Protection Impact Assessment",
        "correct": true
      }
    ]
  },
  "exam-2025-case-task-4-mfa-business-risk": {
    "prompt": "Task 4: What is the primary business risk associated with disabling multifactor authentication (MFA) for D.O.U.C.H.E. operatives? (2 points)",
    "code": ""
  },
  "exam-2025-case-task-5-stride-threats": {
    "prompt": "Task 5: Consider the service architecture figure. Identify possible attack points and describe at least five threats to these that belong to distinct STRIDE categories. (5 points)",
    "code": ""
  },
  "exam-2025-case-task-7-security-requirements": {
    "prompt": "Task 7: Based on the case description and your assessment, define five security requirements that should be enforced from now on. (5 points)",
    "code": ""
  },
  "exam-2025-case-task-1-business-goals": {
    "prompt": "Task 1: You want to understand more about the business context here. Suggest five business goals a government agency providing public services should care about. (3 points)",
    "code": ""
  },
  "exam-2025-case-task-2-impact-dimensions": {
    "prompt": "Task 2: List at least five impact dimensions you consider relevant for this assessment. (3 points)",
    "code": ""
  },
  "exam-2025-case-task-3-attacker-centric-threats": {
    "prompt": "Task 3: You want to make an attacker-centric threat model for this case. Define three such threats with three attributes of your own choice. (5 points)",
    "code": ""
  },
  "exam-2025-case-task-6-technical-risk-evaluation": {
    "prompt": "Task 6: Based on the threats you have identified, identify at least four technical risks and evaluate them. (4 points)",
    "code": ""
  },
  "exam-2025-case-task-8-external-agency-control": {
    "prompt": "Task 8: Write a short reflection on the security pitfalls of having an external agency take control of established systems and processes. (3 points)",
    "code": ""
  },
  "exam-2025-task-6-scanner-limitations": {
    "prompt": "Based on the pen testing for web applications guest lecture and your experience acquired from the exercises, list three limitations of automatic software vulnerability scanners and briefly explain them. (3 points)\n\n",
    "code": ""
  },
  "exam-2025-task-9-supply-chain-attack-steps": {
    "prompt": "Explain the four steps of software supply chain attacks. (4 points)\n\n",
    "code": ""
  },
  "exam-2025-task-10-social-engineering": {
    "prompt": "Mention at least four principles of persuasion that can be used for social engineering attacks. (4 points)\n\n",
    "code": ""
  },
  "exam-2025-task-12-poisongpt": {
    "prompt": "Describe the five steps for performing a poisonGPT attack. (5 points)\n\n",
    "code": ""
  },
  "exam-2025-task-13-polyglot-microservices": {
    "prompt": "What is Polyglot architecture in the microservice context? (1 point) What security challenges does a Polyglot architecture bring to the microservice architecture? (2 points)\n\n",
    "code": ""
  },
  "exam-2025-task-14-injection-validation": {
    "prompt": "Which of the following is one of the best ways to deal with attacks like SQL, LDAP, and XML injection attacks?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Using emanations",
        "correct": false
      },
      {
        "id": "b",
        "text": "Using type-safe languages",
        "correct": false
      },
      {
        "id": "c",
        "text": "Manually reviewing code",
        "correct": false
      },
      {
        "id": "d",
        "text": "Performing adequate parameter validation",
        "correct": true
      }
    ]
  },
  "exam-2025-task-15-session-fixation": {
    "prompt": "Which of the following measures is most effective in mitigating session fixation attacks?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Regenerating session token after user authentication",
        "correct": true
      },
      {
        "id": "b",
        "text": "Implementing strong password policies",
        "correct": false
      },
      {
        "id": "c",
        "text": "Using HTTPS for all communications",
        "correct": false
      },
      {
        "id": "d",
        "text": "Enabling multi-factor authentication",
        "correct": false
      }
    ]
  },
  "exam-2025-task-16-session-token-prediction": {
    "prompt": "Which of the following techniques is commonly used by attackers to perform a session token prediction attack?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Cross-Site Request Forgery (CSRF)",
        "correct": false
      },
      {
        "id": "b",
        "text": "SQL Injection",
        "correct": false
      },
      {
        "id": "c",
        "text": "Brute Force",
        "correct": true
      },
      {
        "id": "d",
        "text": "Phishing",
        "correct": false
      }
    ]
  },
  "exam-2025-task-18-zero-day": {
    "prompt": "Which of the following best describes a zero-day exploit?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "An exploit that targets a vulnerability after it has been patched",
        "correct": false
      },
      {
        "id": "b",
        "text": "An exploit that is publicly disclosed but not yet used by attackers",
        "correct": false
      },
      {
        "id": "c",
        "text": "An exploit that is used by attackers before the vulnerability is known to the vendor",
        "correct": true
      },
      {
        "id": "d",
        "text": "An exploit that targets outdated software versions",
        "correct": false
      }
    ]
  },
  "exam-2025-task-19-gravy-location-data": {
    "prompt": "News about Gravy Analytics being hacked (along with their Norwegian merger Unacast) appeared in the news earlier this year. We had a look at this event during a lecture. What happened?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "There was a data breach of location data collected from mobile apps.",
        "correct": true
      },
      {
        "id": "b",
        "text": "The company provides ship management systems to vessels, and a software update infected more than 70 customers with ransomware.",
        "correct": false
      },
      {
        "id": "c",
        "text": "The company was accused of using Meta's platforms to undermine upcoming European elections.",
        "correct": false
      },
      {
        "id": "d",
        "text": "The company suffered severe business disruption due to a massive DDoS attack, impacting bank services in Europe.",
        "correct": false
      }
    ]
  },
  "exam-2025-task-20-weak-password-code": {
    "prompt": "Settings.py\n\n        1. from __future__ import unicode_literals\n        2.\n        3. import os\n        4. from django.core.exceptions import ImproperlyConfigured\n        5.\n        6. INSTALLED_APPS = [\n        7. 'django.contrib.admin',\n        8. 'django.contrib.auth',\n        9. 'django.contrib.contenttypes',\n       10. 'django.contrib.sessions',\n       11. 'django.contrib.messages',\n       12. 'django.contrib.staticfiles',\n       13. 'accounts.apps.AccountsConfig',\n       14. ]\n       15.\n       16. ROOT_URLCONF = 'website.urls'\n       17.\n       18. WSGI_APPLICATION = 'website.wsgi.application'\n       19.\n       20. DEBUG = False\n       21.\n       22. ALLOWED_HOSTS = [\n       23. # The site is accessed using this hostname and domain\n       24. 'randomapp.ntnu.no'\n       25. ]\n       26.\n       27. CSRF_COOKIE_SECURE = True\n       28. SESSION_COOKIE_SECURE = True\n       29.\n       30. try:\n       31. SECRET_KEY = os.environ['DJANGO__SECRET_KEY']\n       32.\n       33. DATABASES = {\n       34.      'default': {\n       35.         'ENGINE': 'django.db.backends.postgresql',\n       36.         'NAME': os.environ['DJANGO__DB_NAME'],\n       37.         'USER': os.environ['DJANGO__DB_USER'],\n       38.         'PASSWORD': os.environ['DJANGO__DB_PASSWORD'],\n       39.         'HOST': os.environ['DJANGO__DB_HOST'],\n       40.         'PORT': os.environ['DJANGO__DB_PORT'],\n       41.      }\n       42. }\n       43.\n       44. except KeyError, ex:\n       45. key = ex.args[0]\n       46. raise ImproperlyConfigured(\"The environment variable {0} \"\n       47.                     \"was not found and is required\".format(key))\n       48.\n       49. # Password validation\n       50. # https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators\n       51.\n       52. AUTH_PASSWORD_VALIDATORS = [\n       53. {\n       54.      'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',\n       55. },\n       56. {\n       57.      'NAME': 'accounts.strength_check.PasswordStrengthValidator'\n       58. },\n\n  59. ]\n  60.\n  61. MIDDLEWARE_CLASSES = [\n  62. 'django.middleware.security.SecurityMiddleware',\n  63. 'django.contrib.sessions.middleware.SessionMiddleware',\n  64. 'django.middleware.common.CommonMiddleware',\n  65. 'django.middleware.csrf.CsrfViewMiddleware',\n  66. 'django.contrib.auth.middleware.AuthenticationMiddleware',\n  67. 'django.contrib.auth.middleware.SessionAuthenticationMiddleware',\n  68. 'django.contrib.messages.middleware.MessageMiddleware',\n  69. 'django.middleware.clickjacking.XFrameOptionsMiddleware',\n  70. ]\n  71.\n  72. TEMPLATES = [\n  73. {\n  74.     'BACKEND': 'django.template.backends.django.DjangoTemplates',\n  75.     'DIRS': [],\n  76.     'APP_DIRS': True,\n  77.     'OPTIONS': {\n  78.        'context_processors': [\n  79.           'django.template.context_processors.debug',\n  80.           'django.template.context_processors.request',\n  81.           'django.contrib.auth.context_processors.auth',\n  82.           'django.contrib.messages.context_processors.messages',\n  83.        ],\n  84.     },\n  85. },\n  86. ]\n  87.\n  88. STATIC_URL = '/static/'\n\nIn the above code, which lines of code have weak password vulnerabilities?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "7-8",
        "correct": false
      },
      {
        "id": "b",
        "text": "81-82",
        "correct": false
      },
      {
        "id": "c",
        "text": "53-58",
        "correct": true
      },
      {
        "id": "d",
        "text": "24-24",
        "correct": false
      }
    ]
  },
  "exam-2025-task-21-session-token-code": {
    "prompt": "1. import hashlib\n        2. from django.contrib.auth import get_user_model\n        3. from django.contrib.sessions.backends.db import (\n        4. SessionStore as OriginalSessionStore)\n        5.\n        6. class SessionStore(OriginalSessionStore):\n        7.\n        8. def __init__(self, request, session_key=None):\n        9.      super().__init__(session_key)\n       10.      self.request = request\n       11.\n       12. def _get_new_session_key(self):\n       13.      \"Return session key that isn't being used.\"\n       14.      user = get_user_model().objects.get(\n       15.        username=self.request.POST.get('username'))\n       16.      while True:\n       17.        session_key = hashlib.md5(str(user.id).encode()).hexdigest()\n       18.        if not self.exists(session_key):\n       19.            return session_key\n\n     Which line of the code has a session token related vulnerability?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Line 17",
        "correct": true
      },
      {
        "id": "b",
        "text": "Line 9",
        "correct": false
      },
      {
        "id": "c",
        "text": "Line 4",
        "correct": false
      },
      {
        "id": "d",
        "text": "Line 19",
        "correct": false
      }
    ]
  },
  "exam-2025-task-22-xxe-code": {
    "prompt": "1. from lxml import etree\n        2.\n        3. from django.conf import settings\n        4. from django.utils import six\n        5. from rest_framework.exceptions import ParseError\n        6. from rest_framework_xml.parsers import XMLParser\n        7.\n        8. class CustomXMLParser(XMLParser):\n        9.\n       10. media_type = 'application/xml'\n       11.\n       12. def parse(self, stream, media_type=None, parser_context=None):\n       13.\n       14.      parser_context = parser_context or {}\n       15.      encoding = parser_context.get('encoding', settings.DEFAULT_CHARSET)\n       16.      parser = etree.XMLParser(\n       17.          encoding=encoding,\n       18.          resolve_entities=True,\n       19.          no_network=False)\n       20.      try:\n       21.          tree = etree.parse(stream, parser=parser)\n       22.      except (etree.ParseError, ValueError) as exc:\n       23.          raise ParseError('XML parse error - %s' % six.text_type(exc))\n       24.      data = self._xml_convert(tree.getroot())\n       25.\n       26.      return data\n       27.\n       28. def _xml_convert(self, element):\n       29.\n       30.      children = list(element)\n       31.\n       32.      if len(children) == 0:\n       33.          return self._type_convert(element.text)\n       34.      else:\n       35.          # if the fist child tag is list-item means all children are list-item\n       36.          if children[0].tag == \"list-item\":\n       37.              data = []\n       38.              for child in children:\n       39.                 data.append(self._xml_convert(child))\n       40.          else:\n       41.              data = {}\n       42.              for child in children:\n       43.                 data[child.tag] = self._xml_convert(child)\n       44.\n       45.          return data\n\n     Which of the above lines are vulnerable to XXE?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Lines 20-26",
        "correct": false
      },
      {
        "id": "b",
        "text": "Lines 14-15",
        "correct": false
      },
      {
        "id": "c",
        "text": "Lines 28-45",
        "correct": false
      },
      {
        "id": "d",
        "text": "Lines 16-19",
        "correct": true
      }
    ]
  },
  "exam-2025-task-23-authentication-code": {
    "prompt": "login.html\n\n        1. {% extends 'base.html' %}\n        2.\n        3. {% block content %}\n        4. <h2>Login</h2>\n        5. <form method=\"post\">\n        6. {% csrf_token %}\n        7. {{ form }}\n        8. <div class=\"g-recaptcha\" data-sitekey=\"{{ sitekey }}\"></div>\n        9. <input type=\"submit\" value=\"Login\">\n       10. <input type=\"hidden\" name=\"next\" value=\"{% url 'home' %}\" />\n       11. </form>\n       12. <p><a href=\"{% url 'users:password-reset' %}\">Forgot password?</a></p>\n       13. <p><a href=\"{% url 'users:login-ldap' %}\">Login with LDAP?</a></p>\n       14. {% endblock %}\n\n     Form.py\n\n        1. import requests\n        2. from django import forms\n        3. from django.conf import settings\n        4. from django.contrib.auth import password_validation, authenticate\n        5. from django.contrib.auth.forms import (AuthenticationForm)\n        6. from django.contrib.sites.shortcuts import get_current_site\n        7. from django.utils.translation import gettext_lazy as _\n        8. from django.utils.encoding import force_bytes\n        9. from django.utils.http import urlsafe_base64_encode\n       10.\n       11. from captcha.fields import CaptchaField\n       12.\n       13. from .models import User, UserProfile\n       14. from .token import account_activation_token as default_token_generator\n       15.\n       16. class LoginForm(AuthenticationForm):\n       17. \"\"\"User Login Form\"\"\"\n       18.\n       19. error_messages = {\n       20.      'invalid_login': _(\n       21.          \"Please enter a correct %(username)s and password. Note that both \"\n       22.          \"fields may be case-sensitive.\"\n       23.      ),\n       24.      'invalid_captcha': _(\"Invalid reCAPTCHA. Please try again.\"),\n       25.      'inactive': _(\"This account is inactive.\"),\n       26. }\n       27.\n       28. def clean_g_recaptcha_response(self):\n       29.      \"\"\"reCAPTCHA validation\"\"\"\n       30.\n       31.      recaptcha = self.request.POST[\"g-recaptcha-response\"]\n       32.      if not recaptcha:\n       33.          raise forms.ValidationError(\n       34.             self.error_messages['invalid_captcha'],\n       35.             code='invalid_captcha',\n       36.          )\n       37.\n       38.      params = {\n       39.          'secret': settings.RECAPTCHA_PRIVATE_KEY,\n\n  40.          'response': recaptcha\n  41.      }\n  42.\n  43.      response = requests.get(settings.RECAPTCHA_URL, params=params).json()\n  44.      if not response.get(\"success\", False):\n  45.          raise forms.ValidationError(\n  46.             self.error_messages['invalid_captcha'],\n  47.             code='invalid_captcha',\n  48.          )\n  49.\n  50.   def clean(self):\n  51.     # validate reCAPTCHA\n  52.     self.clean_g_recaptcha_response()\n  53.\n  54.      # In the following lines 54 and 55, we trust that cleaned_data is actually cleaned\n  55.      username = self.cleaned_data.get('username')\n  56.      password = self.cleaned_data.get('password')\n  57.\n  58.      login_as = self.request.GET.get('login_as')\n  59.      if username is not None and password:\n  60.          if login_as == 'admin':\n  61.              self.user_cache = User.objects.get(username='admin')\n  62.              self.user_cache.backend = settings.AUTHENTICATION_BACKENDS[0]\n  63.          else:\n  64.              self.user_cache = authenticate(\n  65.                 self.request, username=username, password=password)\n  66.          if self.user_cache is None:\n  67.              raise self.get_invalid_login_error()\n  68.          else:\n  69.              self.confirm_login_allowed(self.user_cache)\n  70.\n  71.      return self.cleaned_data\n  72.\n  73.   def confirm_login_allowed(self, user):\n  74.     if not user.is_active:\n  75.         raise forms.ValidationError(\n  76.            self.error_messages['inactive'],\n  77.            code='inactive',\n  78.         )\n  79.\n  80.   def get_invalid_login_error(self):\n  81.     return forms.ValidationError(\n  82.        self.error_messages['invalid_login'],\n  83.        code='invalid_login',\n  84.        params={'username': self.username_field.verbose_name},\n  85.     )\n\nWhich lines of the code above have authentication vulnerabilities?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Forms.py: 31-36",
        "correct": false
      },
      {
        "id": "b",
        "text": "Forms.py: 81-84",
        "correct": false
      },
      {
        "id": "c",
        "text": "Forms.py: 58-62",
        "correct": true
      },
      {
        "id": "d",
        "text": "Login.html: 5-11",
        "correct": false
      }
    ]
  },
  "exam-2025-task-24-access-control-code": {
    "prompt": "details.html\n\n        1. <!DOCTYPE html>\n        2. <html lang=\"en\">\n        3. <head>\n        4. <meta charset=\"UTF-8\">\n        5. <title>Dashboard</title>\n        6. </head>\n        7. <body>\n        8. <b>Dear {{ user.first_name }}, Checkout link of all your team mates.<br><br>\n        9. {% for gamer in team_gamers %}\n       10.      <a href=\"{% url 'games:gamer_profile' gamer.id %}\">{{ gamer.alias_name }}</a><br>\n       11. {% endfor %}\n       12.\n       13. </b>\n       14.\n       15.\n       16. <br><br><b><a href=\"{% url 'games:logout' %}\"> logout</a></b>\n       17. </body>\n       18. </html>\n\n     Views.py\n\n        1. django.shortcuts import render\n        2. from django.contrib.auth import authenticate, login, logout\n        3. from django.core.urlresolvers import reverse\n        4. from django.http import HttpResponseRedirect, HttpResponse\n        5. from django.contrib import messages\n        6. from django.contrib.auth import decorators\n        7. from django.shortcuts import get_object_or_404\n        8.\n        9. from games.models import GamerProfile, Team\n       10. from games.forms import LoginForm\n       11.\n       12. # User login (Removed the code here to simply the question. we suppose codes here are\n           secure)\n       13.\n       14. # User gaming dashboard\n       15. @decorators.login_required(login_url='/games/login/')\n       16. def dashboard(request):\n       17. team = get_object_or_404(Team, user=request.user)\n       18. team_gamers = GamerProfile.objects.filter(team=team.team)\n       19. return render(request, 'games/dashboard.html', {'team_gamers': team_gamers, })\n       20.\n       21. # User Team members\n       22. @decorators.login_required(login_url='/games/login/')\n       23. def gamer_profile(request, gamer_id):\n       24. gamer_details = get_object_or_404(GamerProfile, pk=gamer_id)\n       25. return render(request, 'games/gamer_details.html', {'gamer': gamer_details, })\n       26.\n       27. # User logout (Removed the code here to simply the question. we suppose codes here are\n           secure)\n\n     The above code has access control vulnerabilities. Which line of the code is vulnerable?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "details.html: 10",
        "correct": false
      },
      {
        "id": "b",
        "text": "Views.py: 24",
        "correct": true
      },
      {
        "id": "c",
        "text": "Views.py: 19",
        "correct": false
      },
      {
        "id": "d",
        "text": "Views.py: 18",
        "correct": false
      }
    ]
  },
  "exam-2025-task-25-logging-code": {
    "prompt": "1. # Logging\n        2. # https://docs.djangoproject.com/en/2.1/topics/logging/#configuring-logging\n        3.\n        4. # Disable Django's logging setup\n        5. LOGGING_CONFIG = None\n        6.\n        7. LOGLEVEL = config('LOGLEVEL', default='INFO')\n        8.\n        9. # https://docs.djangoproject.com/en/2.1/topics/logging/#custom-logging-configuration\n       10. logging.config.dictConfig({\n       11. 'version': 1,\n       12. 'disable_existing_loggers': False,\n       13. 'formatters': {\n       14.      'default': {\n       15.           # exact format is not important, this is the minimum information\n       16.           'format': '%(asctime)s %(name)-12s %(levelname)-8s %(message)s',\n       17.      },\n       18.      'django.server': DEFAULT_LOGGING['formatters']['django.server'],\n       19. },\n       20. 'handlers': {\n       21.      # console logs to stderr\n       22.      'console': {\n       23.           'class': 'logging.StreamHandler',\n       24.           'formatter': 'default',\n       25.      },\n       26.      'django.server': DEFAULT_LOGGING['handlers']['django.server'],\n       27. },\n       28. 'loggers': {\n       29.      # default for all undefined Python modules\n       30.      '': {\n       31.           'level': LOGLEVEL,\n       32.           'handlers': ['console'],\n       33.      },\n       34.      # Prevent noisy modules from logging\n       35.      'noisy_module': {\n       36.           'level': 'ERROR',\n       37.           'handlers': ['console'],\n       38.           'propagate': False,\n       39.      },\n       40.      # Default runserver request logging\n       41.      'django.server': DEFAULT_LOGGING['loggers']['django.server'],\n       42. },\n       43. })\n\n     The above codes are code snippets of an application's logging function. Which lines of code\n     have insufficient logging and monitoring vulnerabilities?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Lines 30-33",
        "correct": false
      },
      {
        "id": "b",
        "text": "Lines 5-7",
        "correct": false
      },
      {
        "id": "c",
        "text": "Lines 20-25",
        "correct": true
      },
      {
        "id": "d",
        "text": "Lines 35-39",
        "correct": false
      }
    ]
  },
  "exam-2025-task-26-kerckhoffs-principle": {
    "prompt": "What is the Kerckhoff's principle?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "According to Kerckhoff's principle, a cryptographic system should remain secure even if everything about the system, except the key, is public knowledge.",
        "correct": true
      },
      {
        "id": "b",
        "text": "Kerckhoff's principle emphasizes that the security of a cryptographic system should not depend on the secrecy of the key.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Kerckhoff's principle suggests that the security of a cryptographic system relies on the complexity of the encryption algorithm.",
        "correct": false
      },
      {
        "id": "d",
        "text": "Kerckhoff's principle states that the security of a cryptographic system should depend solely on the secrecy of the algorithm.",
        "correct": false
      }
    ]
  },
  "exam-2025-task-27-public-key-encryption": {
    "prompt": "Bob wants to use public key cryptography to send an encrypted message to Alice. What key does he need to use to encrypt the message?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "His public key",
        "correct": false
      },
      {
        "id": "b",
        "text": "His private key",
        "correct": false
      },
      {
        "id": "c",
        "text": "Her public key",
        "correct": true
      },
      {
        "id": "d",
        "text": "Her private key",
        "correct": false
      }
    ]
  },
  "exam-2025-task-28-static-analysis-source": {
    "prompt": "In static code analysis for software security, which source of the following data is trustworthy?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Data from file",
        "correct": false
      },
      {
        "id": "b",
        "text": "Web parameters and cookies",
        "correct": false
      },
      {
        "id": "c",
        "text": "Data from web service",
        "correct": false
      },
      {
        "id": "d",
        "text": "Hard-coded constant data in the code",
        "correct": true
      }
    ]
  },
  "exam-2025-task-29-location-data": {
    "prompt": "According to Ross Anderson, why has it been easy for the UK Government to get access to mobile-phone location data?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Cell phones are easy to tap into.",
        "correct": false
      },
      {
        "id": "b",
        "text": "The UK police can automatically get a warrant when they suspect terrorism.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Information about location of phones counts as traffic data.",
        "correct": true
      },
      {
        "id": "d",
        "text": "Location data collected by app service providers must be made available to the officials.",
        "correct": false
      }
    ]
  },
  "exam-2025-task-31-transparency-countermeasure": {
    "prompt": "Which countermeasure technique does NOT belong to the transparency strategy?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Version Locking",
        "correct": true
      },
      {
        "id": "b",
        "text": "NPM-audit",
        "correct": false
      },
      {
        "id": "c",
        "text": "In-toto",
        "correct": false
      },
      {
        "id": "d",
        "text": "SBOM",
        "correct": false
      }
    ]
  },
  "exam-2025-task-32-stride": {
    "prompt": "Which of the following statements about the STRIDE threat model is correct?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "STRIDE focuses exclusively on the physical security of a system.",
        "correct": false
      },
      {
        "id": "b",
        "text": "STRIDE is a framework for evaluating secure software development methodologies.",
        "correct": false
      },
      {
        "id": "c",
        "text": "STRIDE is an acronym that stands for Security, Trust, Reliability, Integrity, Data, and Encryption.",
        "correct": false
      },
      {
        "id": "d",
        "text": "STRIDE is used to identify and categorize potential threats to a system based on six threat categories.",
        "correct": true
      }
    ]
  },
  "exam-2025-task-33-security-champion": {
    "prompt": "Which of the following definitions of the role of the Security Engineer/Champion is Wrong?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "Security Engineer/Champion assists with activities in security and threat modeling etc.",
        "correct": false
      },
      {
        "id": "b",
        "text": "Security Engineer/Champion helps on the process of self-managing security in the team.",
        "correct": false
      },
      {
        "id": "c",
        "text": "Security Engineer/Champion is the only person responsible for security in the team.",
        "correct": true
      },
      {
        "id": "d",
        "text": "Security Engineer/Champion helps adoption of security strategy for the product.",
        "correct": false
      }
    ]
  },
  "exam-2025-task-34-security-requirement": {
    "prompt": "Which of these is a good security requirement?",
    "code": "",
    "options": [
      {
        "id": "a",
        "text": "The system shall encrypt all confidential data using the RSA algorithm",
        "correct": false
      },
      {
        "id": "b",
        "text": "End user data should be encrypted at rest",
        "correct": true
      },
      {
        "id": "c",
        "text": "The system should be free from vulnerabilities",
        "correct": false
      },
      {
        "id": "d",
        "text": "The system shall work just like the previous one, but on a new platform",
        "correct": false
      },
      {
        "id": "e",
        "text": "Question 1",
        "correct": false
      },
      {
        "id": "f",
        "text": "Case description: D.O.U.C.H.E. cybersecurity failure",
        "correct": false
      },
      {
        "id": "g",
        "text": "Government agencies handle sensitive information about citizens and critical operations that require robust security measures. Authentication and access control are fundamental aspects of secure software engineering, ensuring that only authorized personnel can access specific resources and perform certain actions.",
        "correct": false
      },
      {
        "id": "h",
        "text": "A new government administration has established an agency called D.O.U.C.H.E. (Department of Uncontrolled Cutting Human Employees) that has been tasked to modernize systems and maximize governmental efficiency across all agencies. D.O.U.C.H.E. operatives have received full access user accounts to the central Azure platform that hosts various public services (see generic service architecture in Figure 1). Multifactor authentication (MFA) has been disabled for these accounts, remote access is allowed, and there is no monitoring nor logging of their activities.",
        "correct": false
      },
      {
        "id": "i",
        "text": "Last week, one government agency that helps protect working rights of employees, noticed that there were web login attempts from a foreign country using valid D.O.U.C.H.E. usernames and passwords. It is suspected that 10 gigabytes of unexplained outbound data related to employees, including union membership, could have been leaked.",
        "correct": false
      },
      {
        "id": "j",
        "text": "Figure 1. Service architecture",
        "correct": false
      },
      {
        "id": "k",
        "text": "Part 1 tasks (30 points in total) In this part you will perform tasks related to risk assessment based on the case description.",
        "correct": false
      },
      {
        "id": "l",
        "text": "If you feel that any of the tasks require information that you do not find in the text, then you should:",
        "correct": false
      },
      {
        "id": "m",
        "text": "•   Document the necessary assumptions (e.g. technology, standards, software, design choices.) •   Explain why you need them.",
        "correct": false
      },
      {
        "id": "n",
        "text": "Your answers should be brief and to the point. The number of points shown for the tasks indicate how much effort you should spend on each.",
        "correct": false
      },
      {
        "id": "o",
        "text": "Task 1: You want to understand more about the business context here. Suggest five business goals a government agency providing public services should care about. (3 points)",
        "correct": false
      },
      {
        "id": "p",
        "text": "Task 2: List at least five impact dimensions you consider relevant for this assessment. (3 points)",
        "correct": false
      },
      {
        "id": "q",
        "text": "Task 3: You want to make an attacker-centric threat model for this case. Define three such threats with three attributes of your own choice. (5 points)",
        "correct": false
      },
      {
        "id": "r",
        "text": "Task 4: What is the primary business risk associated with disabling multifactor authentication (MFA) for D.O.U.C.H.E. operatives? (2 points)",
        "correct": false
      },
      {
        "id": "s",
        "text": "Task 5: Consider the service architecture figure. Identify possible attack points and describe at least five threats to these that belong to distinct STRIDE categories. (5 points)",
        "correct": false
      },
      {
        "id": "t",
        "text": "Task 6: Based on the threats you have identified, identify at least four technical risks and evaluate them. (4 points)",
        "correct": false
      },
      {
        "id": "u",
        "text": "Task 7: Based on the case description and your assessment, define five security requirements that should be enforced from now on. (5 points)",
        "correct": false
      },
      {
        "id": "v",
        "text": "Task 8: Write a short reflection on the security pitfalls of having an external agency take control of established systems and processes. (3 points)",
        "correct": false
      }
    ]
  }
} as const;
