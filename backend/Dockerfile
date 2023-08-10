FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    r-base \
    r-cran-rodbc \
    libssl-dev \
    libffi-dev \
    libxml2-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libxt-dev
# Set the R_HOME environment variable
ENV R_HOME=/usr/lib/R

# Install Rpy2 and required R packages
RUN pip install --no-cache-dir rpy2==3.4.5 \
    && Rscript -e "install.packages(c('stats', 'graphics', 'grDevices', 'utils', 'datasets', 'methods'), repos='https://cloud.r-project.org')"

# Set working directory
WORKDIR /app

# Install dependencies
COPY venv_requirement.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r venv_requirement.txt

# Copy the application code
COPY . .

# Start the app
CMD python3 -m debugpy --wait-for-client --listen 0.0.0.0:5678 -m run.py