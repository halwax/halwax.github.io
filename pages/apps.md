---
layout: page
title: "Apps"
permalink: "/apps/"
---

<ul>
  {% for app in site.apps %}
    <li>
      <a href="{{ app.url }}">{{ app.title }}</a>
      - {{ app.headline }}
    </li>
  {% endfor %}
</ul>